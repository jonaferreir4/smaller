using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;

namespace smaller.Services;

public class RedisCacheService(
    IDistributedCache distributedCache,
    IMemoryCache memoryCache,
    ILogger<RedisCacheService> logger) : ICacheService
{
    private static readonly DistributedCacheEntryOptions DistributedOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24),
        SlidingExpiration = TimeSpan.FromHours(2)
    };

    private static readonly MemoryCacheEntryOptions MemoryOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
    };

    public async Task<string?> GetLongUrlAsync(string code, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(code);

        // L1 Cache: In-Memory (Ultra Fast, sub-millisecond)
        if (memoryCache.TryGetValue<string>(cacheKey, out var memoryUrl) && !string.IsNullOrEmpty(memoryUrl))
        {
            return memoryUrl;
        }

        // L2 Cache: Distributed Redis
        try
        {
            var redisUrl = await distributedCache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrEmpty(redisUrl))
            {
                // Populate L1 cache for subsequent requests
                memoryCache.Set(cacheKey, redisUrl, MemoryOptions);
                return redisUrl;
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching cached URL from Redis for code {Code}", code);
        }

        return null;
    }

    public async Task SetLongUrlAsync(string code, string longUrl, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(code);

        // Set L1 Cache
        memoryCache.Set(cacheKey, longUrl, MemoryOptions);

        // Set L2 Cache
        try
        {
            await distributedCache.SetStringAsync(cacheKey, longUrl, DistributedOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error setting Redis cache for code {Code}", code);
        }
    }

    public async Task<ShortenedUrlCacheItem?> GetUrlCacheAsync(string code, CancellationToken cancellationToken = default)
    {
        var rawJson = await GetLongUrlAsync(code, cancellationToken);
        if (string.IsNullOrEmpty(rawJson)) return null;

        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<ShortenedUrlCacheItem>(rawJson);
        }
        catch
        {
            // Fallback para caso seja apenas a string pura da LongUrl antiga
            return new ShortenedUrlCacheItem(Guid.Empty, rawJson, null, null);
        }
    }

    public async Task SetUrlCacheAsync(string code, ShortenedUrlCacheItem item, CancellationToken cancellationToken = default)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(item);
        await SetLongUrlAsync(code, json, cancellationToken);
    }

    public async Task RemoveAsync(string code, CancellationToken cancellationToken = default)
    {
        var cacheKey = GetCacheKey(code);

        // Remove from L1
        memoryCache.Remove(cacheKey);

        // Remove from L2
        try
        {
            await distributedCache.RemoveAsync(cacheKey, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error removing Redis cache for code {Code}", code);
        }
    }

    private static string GetCacheKey(string code) => $"short_url:{code}";
}

public record ShortenedUrlCacheItem(Guid Id, string LongUrl, DateTime? ExpiresAtUtc, int? MaxClicks);
