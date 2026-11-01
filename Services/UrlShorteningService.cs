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

    public async Task<ShortenedUrlResponse> CreateShortenedUrlAsync(ShortenUrlRequest request, string baseUrl, Guid? userId = null)
    {
        if (!SecurityValidator.IsValidUrl(request.Url, out var urlError))
        {
            throw new InvalidOperationException(urlError);
        }

        if (userId.HasValue)
        {
            var user = await context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId.Value);
            if (user != null && user.Plan.Equals("Free", StringComparison.OrdinalIgnoreCase))
            {
                var freeLimitStr = Environment.GetEnvironmentVariable("FREE_PLAN_LINK_LIMIT");
                var freeLimit = int.TryParse(freeLimitStr, out var parsedLimit) ? parsedLimit : 100;

                var count = await context.ShortenedUrls.AsNoTracking().CountAsync(s => s.UserId == userId.Value);
                if (count >= freeLimit)
                {
                    throw new InvalidOperationException($"Free plan limit reached ({freeLimit} links). Upgrade to Pro for unlimited links.");
                }
            }
        }

        var domainName = Environment.GetEnvironmentVariable("DOMAIN_NAME");
        if (!string.IsNullOrEmpty(domainName) && Uri.TryCreate(request.Url, UriKind.Absolute, out var originalUri))
        {
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

            if (!SecurityValidator.IsValidCustomCode(custom, out var customCodeError))
            {
                throw new InvalidOperationException(customCodeError);
            }

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
            UserId = userId,
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

        if (shortenedUrl.IsActive && (!shortenedUrl.ExpiresAtUtc.HasValue || shortenedUrl.ExpiresAtUtc > DateTime.UtcNow))
        {
            await cacheService.SetUrlCacheAsync(code, new ShortenedUrlCacheItem(
                shortenedUrl.Id,
                shortenedUrl.LongUrl,
                shortenedUrl.ExpiresAtUtc,
                shortenedUrl.MaxClicks));
        }

        return ToResponse(shortenedUrl, baseUrl);
    }

    public async Task<string?> GetLongUrlAsync(string code, string? ipAddress, string? userAgent)
    {
        var cached = await cacheService.GetUrlCacheAsync(code);
        if (cached != null)
        {
            if (cached.ExpiresAtUtc.HasValue && cached.ExpiresAtUtc.Value <= DateTime.UtcNow)
            {
                await cacheService.RemoveAsync(code);
                return null;
            }

            if (!cached.MaxClicks.HasValue)
            {
                if (cached.Id != Guid.Empty)
                {
                    await accessLogQueue.QueueAccessLogAsync(new AccessLog
                    {
                        Id = Guid.NewGuid(),
                        ShortenedUrlId = cached.Id,
                        IpAdress = string.IsNullOrWhiteSpace(ipAddress) ? "Unknown" : ipAddress,
                        UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "Unknown" : userAgent,
                        AccessDate = DateTime.UtcNow
                    });
                }
                return cached.LongUrl;
            }
        }

        var entity = await context.ShortenedUrls
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null || !entity.IsActive) return null;

        if (entity.ExpiresAtUtc.HasValue && entity.ExpiresAtUtc.Value <= DateTime.UtcNow)
        {
            return null;
        }

        if (entity.MaxClicks.HasValue && entity.Click >= entity.MaxClicks.Value)
        {
            return null;
        }

        if (!entity.MaxClicks.HasValue)
        {
            await cacheService.SetUrlCacheAsync(code, new ShortenedUrlCacheItem(
                entity.Id,
                entity.LongUrl,
                entity.ExpiresAtUtc,
                entity.MaxClicks));
        }

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

    public async Task<ShortenedUrlResponse?> DeleteShortUrlAsync(string code, string baseUrl, Guid? userId = null, string? role = null)
    {
        var entity = await context.ShortenedUrls.FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null) return null;

        if (entity.UserId.HasValue)
        {
            if (!userId.HasValue || (entity.UserId != userId.Value && role != "Admin"))
            {
                throw new UnauthorizedAccessException("You are not authorized to delete this link.");
            }
        }
        else if (role != "Admin")
        {
            throw new UnauthorizedAccessException("Anonymous links can only be removed by administrators.");
        }

        context.Remove(entity);
        await context.SaveChangesAsync();

        await cacheService.RemoveAsync(code);

        return ToResponse(entity, baseUrl);
    }

    public async Task<ShortenedUrlResponse?> GetShortUrlAsync(string code, string baseUrl)
    {
        var entity = await context.ShortenedUrls.AsNoTracking().FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null) return null;
        return ToResponse(entity, baseUrl);
    }

    public async Task<List<ShortenedUrlResponse>> GetUserUrlsAsync(string baseUrl, Guid userId, string? role = null, int page = 1, int pageSize = 50)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = context.ShortenedUrls.AsNoTracking();

        if (role != "Admin")
        {
            query = query.Where(s => s.UserId == userId);
        }

        var listResponse = await query
            .OrderByDescending(s => s.CreatedOnUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return listResponse.Select(s => ToResponse(s, baseUrl)).ToList();
    }

    public async Task<List<ShortenedUrlResponse>> GetAllUrlsAsync(string baseUrl)
    {
        var listResponse = await context.ShortenedUrls
            .AsNoTracking()
            .OrderByDescending(s => s.CreatedOnUtc)
            .Take(100)
            .ToListAsync();

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