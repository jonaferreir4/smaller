using smaller.Http.Responses;

namespace smaller.Services;

public interface IUrlAnalyticsService
{
    Task<UrlAnalyticsResponse?> GetAnalyticsAsync(string code, string baseUrl);
    Task<int?> GetClickCounterAsync(string code);
}
