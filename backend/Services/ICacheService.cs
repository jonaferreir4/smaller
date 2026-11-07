namespace smaller.Services;

public interface ICacheService
{
    Task<string?> GetLongUrlAsync(string code, CancellationToken cancellationToken = default);
    Task SetLongUrlAsync(string code, string longUrl, CancellationToken cancellationToken = default);
    Task<ShortenedUrlCacheItem?> GetUrlCacheAsync(string code, CancellationToken cancellationToken = default);
    Task SetUrlCacheAsync(string code, ShortenedUrlCacheItem item, CancellationToken cancellationToken = default);
    Task RemoveAsync(string code, CancellationToken cancellationToken = default);
}
