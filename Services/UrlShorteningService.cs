using System.Security.Cryptography;
using smaller.Data;
using smaller.Http.Requests;
using smaller.Http.Responses;
using smaller.Models;
using smaller.utils;
using Microsoft.EntityFrameworkCore;

namespace smaller.Services;

public class UrlShorteningService(
    ApplicationDbContext context,
    RedisCacheService cacheService,
    AccessLogQueue accessLogQueue)
{
    public async Task<string> GenerateUniqueCode()
    {
        var codeChars = new char[ShortLinkSettings.Length];
        int maxValue = ShortLinkSettings.Alphabet.Length;
        var bytes = new byte[ShortLinkSettings.Length];

        while (true)
        {
            RandomNumberGenerator.Fill(bytes);
            for (var i = 0; i < ShortLinkSettings.Length; i++)
            {
                var randomIndex = bytes[i] % maxValue;
                codeChars[i] = ShortLinkSettings.Alphabet[randomIndex];
            }

            var code = new string(codeChars);

            if (!await context.ShortenedUrls.AsNoTracking().AnyAsync(s => s.Code == code))
            {
                return code;
            }
        }
    }

    public async Task<ShortenedUrlResponse> CreateShortenedUrlAsync(ShortenUrlRequest request, string baseUrl)
    {
        var domainName = Environment.GetEnvironmentVariable("DOMAIN_NAME");
        if (!string.IsNullOrEmpty(domainName))
        {
            var originalUri = new Uri(request.Url);
            if (originalUri.Host.Equals(domainName, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("This URL is already shortened.");
            }
        }

        string code;
        bool isCustom = false;

        if (!string.IsNullOrWhiteSpace(request.CustomCode))
        {
            var custom = request.CustomCode.Trim();
            if (await context.ShortenedUrls.AsNoTracking().AnyAsync(s => s.Code == custom))
            {
                throw new InvalidOperationException($"The code '{custom}' is already in use.");
            }
            code = custom;
            isCustom = true;
        }
        else
        {
            code = await GenerateUniqueCode();
        }

        var shortenedUrl = new ShortenedUrl
        {
            Id = Guid.NewGuid(),
            LongUrl = request.Url,
            Code = code,
            ShortUrl = $"{baseUrl}/{code}",
            IsActive = true,
            ExpiresAtUtc = request.ExpiresAtUtc?.ToUniversalTime(),
            MaxClicks = request.MaxClicks,
            IsCustom = isCustom,
            CreatedOnUtc = DateTime.UtcNow
        };

        context.ShortenedUrls.Add(shortenedUrl);
        await context.SaveChangesAsync();

        // Warm up cache
        if (shortenedUrl.IsActive && (!shortenedUrl.ExpiresAtUtc.HasValue || shortenedUrl.ExpiresAtUtc > DateTime.UtcNow))
        {
            await cacheService.SetLongUrlAsync(code, shortenedUrl.LongUrl);
        }

        return ToResponse(shortenedUrl, baseUrl);
    }

    public async Task<string?> GetLongUrlAsync(string code, string? ipAddress, string? userAgent)
    {
        var entity = await context.ShortenedUrls
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null || !entity.IsActive) return null;

        // Expiration Check
        if (entity.ExpiresAtUtc.HasValue && entity.ExpiresAtUtc.Value <= DateTime.UtcNow)
        {
            return null;
        }

        // Max Clicks Check
        if (entity.MaxClicks.HasValue && entity.Click >= entity.MaxClicks.Value)
        {
            return null;
        }

        // Queue access log asynchronously for batch persistence
        var accessLog = new AccessLog
        {
            Id = Guid.NewGuid(),
            ShortenedUrlId = entity.Id,
            IpAdress = string.IsNullOrWhiteSpace(ipAddress) ? "Unknown" : ipAddress,
            UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "Unknown" : userAgent,
            AccessDate = DateTime.UtcNow
        };

        await accessLogQueue.QueueAccessLogAsync(accessLog);

        return entity.LongUrl;
    }

    public async Task<ShortenedUrlResponse?> DeleteShortUrlAsync(string code, string baseUrl)
    {
        var entity = await context.ShortenedUrls.FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null) return null;

        context.Remove(entity);
        await context.SaveChangesAsync();

        // Invalidate cache
        await cacheService.RemoveAsync(code);

        return ToResponse(entity, baseUrl);
    }

    public async Task<ShortenedUrlResponse?> GetShortUrlAsync(string code, string baseUrl)
    {
        var entity = await context.ShortenedUrls.AsNoTracking().FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null) return null;
        return ToResponse(entity, baseUrl);
    }

    public async Task<List<ShortenedUrlResponse>> GetAllUrlsAsync(string baseUrl)
    {
        var listResponse = await context.ShortenedUrls.AsNoTracking().ToListAsync();

        return listResponse.Select(s => ToResponse(s, baseUrl)).ToList();
    }

    public async Task<UrlAnalyticsResponse?> GetAnalyticsAsync(string code, string baseUrl)
    {
        var entity = await context.ShortenedUrls
            .AsNoTracking()
            .Include(s => s.AccessLogs)
            .FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null) return null;

        var logs = entity.AccessLogs;

        var clicksByDate = logs
            .GroupBy(l => l.AccessDate.ToString("yyyy-MM-dd"))
            .ToDictionary(g => g.Key, g => g.Count());

        var topBrowsers = logs
            .GroupBy(l => string.IsNullOrEmpty(l.Browser) ? "Unknown" : l.Browser)
            .ToDictionary(g => g.Key, g => g.Count());

        var topOS = logs
            .GroupBy(l => string.IsNullOrEmpty(l.OperatingSystem) ? "Unknown" : l.OperatingSystem)
            .ToDictionary(g => g.Key, g => g.Count());

        var topDevices = logs
            .GroupBy(l => string.IsNullOrEmpty(l.DeviceType) ? "Desktop" : l.DeviceType)
            .ToDictionary(g => g.Key, g => g.Count());

        return new UrlAnalyticsResponse(
            entity.Code,
            $"{baseUrl}/{entity.Code}",
            entity.LongUrl,
            entity.Click,
            clicksByDate,
            topBrowsers,
            topOS,
            topDevices
        );
    }

    public async Task<int?> GetClickCouter(string code)
    {
        var entity = await context.ShortenedUrls.AsNoTracking().FirstOrDefaultAsync(s => s.Code == code);
        return entity?.Click;
    }

    private static ShortenedUrlResponse ToResponse(ShortenedUrl entity, string baseUrl)
    {
        DateOnly date = DateOnly.FromDateTime(entity.CreatedOnUtc);
        var qrCodeUrl = $"{baseUrl}/api/links/{entity.Code}/qrcode";

        return new ShortenedUrlResponse(
            entity.ShortUrl,
            entity.LongUrl,
            entity.Code,
            entity.Click,
            entity.IsActive,
            entity.ExpiresAtUtc,
            entity.MaxClicks,
            entity.IsCustom,
            qrCodeUrl,
            date
        );
    }
}