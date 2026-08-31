namespace smaller.Http.Requests;

public record ShortenUrlRequest(
    string Url,
    string? CustomCode = null,
    DateTime? ExpiresAtUtc = null,
    int? MaxClicks = null
);