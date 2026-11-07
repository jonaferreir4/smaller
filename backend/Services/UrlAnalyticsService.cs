using smaller.Data;
using smaller.Http.Responses;
using Microsoft.EntityFrameworkCore;

namespace smaller.Services;

public class UrlAnalyticsService(ApplicationDbContext context) : IUrlAnalyticsService
{
    public async Task<UrlAnalyticsResponse?> GetAnalyticsAsync(string code, string baseUrl)
    {
        var entity = await context.ShortenedUrls
            .AsNoTracking()
            .Include(s => s.AccessLogs)
            .FirstOrDefaultAsync(s => s.Code == code);

        if (entity == null || !entity.IsActive) return null;

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

    public async Task<int?> GetClickCounterAsync(string code)
    {
        var entity = await context.ShortenedUrls.AsNoTracking().FirstOrDefaultAsync(s => s.Code == code);
        return entity?.Click;
    }
}
