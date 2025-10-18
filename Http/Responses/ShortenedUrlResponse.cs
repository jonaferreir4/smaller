namespace smaller.Http.Responses;
    public record ShortenedUrlResponse( string ShortUrl, string OriginalUrl, int Clicks, DateOnly CreatedOnUtc );