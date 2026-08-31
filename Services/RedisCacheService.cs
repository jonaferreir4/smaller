using Microsoft.Extensions.Caching.Distributed;

namespace smaller.Services;

public class RedisCacheService(IDistributedCache cache, ILogger<RedisCacheService> logger)
{
    private static readonly DistributedCacheEntryOptions CacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24),
        SlidingExpiration = TimeSpan.FromHours(2)
    };

    public async Task<string?> GetLongUrlAsync(string code, CancellationToken cancellationToken = default)
    {
        try
        {
            var cacheKey = GetCacheKey(code);
            return await cache.GetStringAsync(cacheKey, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching cached URL for code {Code}", code);
            return null;
        }
    }

    public async Task SetLongUrlAsync(string code, string longUrl, CancellationToken cancellationToken = default)
    {
        try
        {
            var cacheKey = GetCacheKey(code);
            await cache.SetStringAsync(cacheKey, longUrl, CacheOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error setting cache for code {Code}", code);
        }
    }

    public async Task RemoveAsync(string code, CancellationToken cancellationToken = default)
    {
        try
        {
            var cacheKey = GetCacheKey(code);
            await cache.RemoveAsync(cacheKey, cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error removing cache for code {Code}", code);
        }
    }

    private static string GetCacheKey(string code) => $"short_url:{code}";
}
