using smaller.Data;
using smaller.Http.Responses;
using smaller.Models;
using smaller.utils;
using Microsoft.EntityFrameworkCore;
namespace smaller.Services;

public class UrlShorteningService(ApplicationDbContext _context)
{
    private readonly Random _random = new();

    public async Task<string> GenerateUniqueCode()
    {
        var codeChars = new char[ShortLinkSettings.Length];
        int maxValue = ShortLinkSettings.Alphabet.Length;

        while (true)
        {
            for (var i = 0; i < ShortLinkSettings.Length; i++)
            {
                var randomIndex = _random.Next(maxValue);

                codeChars[i] = ShortLinkSettings.Alphabet[randomIndex];
            }

            var code = new string(codeChars);

            if (!await _context.ShortenedUrls.AnyAsync(s => s.Code == code))
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

        _context.ShortenedUrls.Add(shortenedUrl);
        await _context.SaveChangesAsync();

        DateOnly date = DateOnly.FromDateTime(shortenedUrl.CreatedOnUtc);
        return new ShortenedUrlResponse(
            shortenedUrl.ShortUrl,
            shortenedUrl.LongUrl,
            shortenedUrl.Click,
            date
            );
    }

    public async Task<string?> GetLongUrlAsync(string code, string ipAdress, string userAgent)
    {
        var entity = await _context.ShortenedUrls.FirstOrDefaultAsync(s => s.Code == code);
        if (entity == null) return null;

        entity.Click += 1;

        var accessLog = new AccessLog
        {
            Id = Guid.NewGuid(),
            ShortenedUrlId = entity.Id,
            IpAdress = ipAdress ?? "Unknown",
            UserAgent = userAgent ?? "Unknown",
            AccessDate = DateTime.UtcNow
        };

        _context.AccessLogs.Add(accessLog);

        await _context.SaveChangesAsync();
        return entity.LongUrl;
    }

    public async Task<ShortenedUrlResponse> DeleteShortUrlAsync(string code)
    {
        var entity = await _context.ShortenedUrls.FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null) return null;

        _context.Remove(entity);
        await _context.SaveChangesAsync();
        DateOnly date = DateOnly.FromDateTime(entity.CreatedOnUtc);
        return new ShortenedUrlResponse(
            entity.ShortUrl,
            entity.LongUrl,
            entity.Click,
            date
         );
    }

    public async Task<ShortenedUrlResponse> GetShortUrlAsync(string code)
    {
        var entity = await _context.ShortenedUrls.FirstOrDefaultAsync(s => s.Code == code);

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
        var listResponse = await _context.ShortenedUrls.ToListAsync();

        return [.. listResponse.Select(s =>
        {
            DateOnly date = DateOnly.FromDateTime(s.CreatedOnUtc);
            return new ShortenedUrlResponse(s.ShortUrl, s.LongUrl, s.Click, date);
        })];
    }

    public async Task<int?> GetClickCouter(string code)
    {
        var entity = await _context.ShortenedUrls.FirstOrDefaultAsync(s => s.Code == code);
        return entity?.Click;
    }
}