using System.Security.Cryptography;
using smaller.Data;
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

    public async Task<ShortenedUrlResponse> CreateShortenedUrlAsync(string originalUrl, string baseUrl)
    {
        var domainName = Environment.GetEnvironmentVariable("DOMAIN_NAME");
        if (!string.IsNullOrEmpty(domainName))
        {
            var originalUri = new Uri(originalUrl);
            if (originalUri.Host.Equals(domainName, StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("This URL is already shortened.");
            }
        }

        var code = await GenerateUniqueCode();

        var shortenedUrl = new ShortenedUrl
        {
            Id = Guid.NewGuid(),
            LongUrl = originalUrl,
            Code = code,
            ShortUrl = $"{baseUrl}/{code}",
            CreatedOnUtc = DateTime.UtcNow
        };

        context.ShortenedUrls.Add(shortenedUrl);
        await context.SaveChangesAsync();

        // Warm up cache
        await cacheService.SetLongUrlAsync(code, shortenedUrl.LongUrl);

        DateOnly date = DateOnly.FromDateTime(shortenedUrl.CreatedOnUtc);
        return new ShortenedUrlResponse(
            shortenedUrl.ShortUrl,
            shortenedUrl.LongUrl,
            shortenedUrl.Click,
            date
        );
    }

    public async Task<string?> GetLongUrlAsync(string code, string? ipAddress, string? userAgent)
    {
        // 1. Try reading from Redis Cache first
        var cachedLongUrl = await cacheService.GetLongUrlAsync(code);
        ShortenedUrl? entity = null;

        if (!string.IsNullOrEmpty(cachedLongUrl))
        {
            // Fetch entity for logging
            entity = await context.ShortenedUrls
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Code == code);
        }
        else
        {
            // Fallback to database
            entity = await context.ShortenedUrls
                .AsNoTracking()
                .FirstOrDefaultAsync(s => s.Code == code);

            if (entity == null) return null;

            cachedLongUrl = entity.LongUrl;
            await cacheService.SetLongUrlAsync(code, cachedLongUrl);
        }

        if (entity == null) return null;

        // 2. Queue access log asynchronously for batch persistence
        var accessLog = new AccessLog
        {
            Id = Guid.NewGuid(),
            ShortenedUrlId = entity.Id,
            IpAdress = string.IsNullOrWhiteSpace(ipAddress) ? "Unknown" : ipAddress,
            UserAgent = string.IsNullOrWhiteSpace(userAgent) ? "Unknown" : userAgent,
            AccessDate = DateTime.UtcNow
        };

        await accessLogQueue.QueueAccessLogAsync(accessLog);

        return cachedLongUrl;
    }

    public async Task<ShortenedUrlResponse?> DeleteShortUrlAsync(string code)
    {
        var entity = await context.ShortenedUrls.FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null) return null;

        context.Remove(entity);
        await context.SaveChangesAsync();

        // Invalidate cache
        await cacheService.RemoveAsync(code);

        DateOnly date = DateOnly.FromDateTime(entity.CreatedOnUtc);
        return new ShortenedUrlResponse(
            entity.ShortUrl,
            entity.LongUrl,
            entity.Click,
            date
        );
    }

    public async Task<ShortenedUrlResponse?> GetShortUrlAsync(string code)
    {
        var entity = await context.ShortenedUrls.AsNoTracking().FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null) return null;
        DateOnly date = DateOnly.FromDateTime(entity.CreatedOnUtc);
        return new ShortenedUrlResponse(
            entity.ShortUrl,
            entity.LongUrl,
            entity.Click,
            date
        );
    }

    public async Task<List<ShortenedUrlResponse>> GetAllUrlsAsync()
    {
        var listResponse = await context.ShortenedUrls.AsNoTracking().ToListAsync();

        return listResponse.Select(s =>
        {
            DateOnly date = DateOnly.FromDateTime(s.CreatedOnUtc);
            return new ShortenedUrlResponse(s.ShortUrl, s.LongUrl, s.Click, date);
        }).ToList();
    }

    public async Task<int?> GetClickCouter(string code)
    {
        var entity = await context.ShortenedUrls.AsNoTracking().FirstOrDefaultAsync(s => s.Code == code);
        return entity?.Click;
    }
}