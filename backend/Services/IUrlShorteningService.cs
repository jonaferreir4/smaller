using smaller.Http.Requests;
using smaller.Http.Responses;

namespace smaller.Services;

public interface IUrlShorteningService
{
    Task<string> GenerateUniqueCode();
    Task<ShortenedUrlResponse> CreateShortenedUrlAsync(ShortenUrlRequest request, string baseUrl, Guid? userId = null);
    Task<string?> GetLongUrlAsync(string code, string? ipAddress, string? userAgent);
    Task<ShortenedUrlResponse?> DeleteShortUrlAsync(string code, string baseUrl, Guid? userId = null, string? role = null);
    Task<ShortenedUrlResponse?> GetShortUrlAsync(string code, string baseUrl);
    Task<List<ShortenedUrlResponse>> GetUserUrlsAsync(string baseUrl, Guid userId, string? role = null, int page = 1, int pageSize = 50);
    Task<List<ShortenedUrlResponse>> GetAllUrlsAsync(string baseUrl);
}
