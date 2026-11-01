namespace smaller.Models;

public class AccessLog
{
    public Guid Id { get; set; }
    public Guid ShortenedUrlId { get; set; }
    public string IpAdress { get; set; } = string.Empty;
    public string UserAgent { get; set; } = string.Empty;
    public string Browser { get; set; } = "Unknown";
    public string OperatingSystem { get; set; } = "Unknown";
    public string DeviceType { get; set; } = "Desktop";
    public DateTime AccessDate { get; set; }

    public ShortenedUrl? ShortenedUrl { get; set; }
}