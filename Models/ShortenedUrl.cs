namespace smaller.Models;

public class ShortenedUrl
{
    public Guid Id { get; set; }
    public string LongUrl { get; set; } = string.Empty;
    public string ShortUrl { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public int Click { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? ExpiresAtUtc { get; set; }
    public int? MaxClicks { get; set; }
    public bool IsCustom { get; set; }
    public DateTime CreatedOnUtc { get; set; }

    public ICollection<AccessLog> AccessLogs { get; set; } = [];
}