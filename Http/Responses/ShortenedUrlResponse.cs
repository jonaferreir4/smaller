namespace smaller.Http.Responses;

public record ShortenedUrlResponse(
    string ShortUrl,
    string OriginalUrl,
    string Code,
    int Clicks,
    bool IsActive,
    DateTime? ExpiresAtUtc,
    int? MaxClicks,
    bool IsCustom,
    string QrCodeUrl,
    DateOnly CreatedOnUtc
);