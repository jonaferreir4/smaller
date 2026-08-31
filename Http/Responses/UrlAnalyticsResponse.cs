namespace smaller.Http.Responses;

public record UrlAnalyticsResponse(
    string Code,
    string ShortUrl,
    string OriginalUrl,
    int TotalClicks,
    Dictionary<string, int> ClicksByDate,
    Dictionary<string, int> TopBrowsers,
    Dictionary<string, int> TopOperatingSystems,
    Dictionary<string, int> TopDeviceTypes
);
