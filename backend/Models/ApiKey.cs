namespace smaller.Models;

public class ApiKey
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string KeyHash { get; set; } = string.Empty;
    public string KeyPrefix { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ExpiresAtUtc { get; set; }
    public bool IsActive { get; set; } = true;

    public User? User { get; set; }
}
