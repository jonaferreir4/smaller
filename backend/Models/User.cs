namespace smaller.Models;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public string Plan { get; set; } = "Free";
    public DateTime CreatedAtUtc { get; set; }

    public ICollection<ShortenedUrl> ShortenedUrls { get; set; } = [];
    public ICollection<ApiKey> ApiKeys { get; set; } = [];
}
