namespace smaller.Http.Responses;

public record ApiKeyResponse(
    Guid Id,
    string Name,
    string KeyPrefix,
    string? SecretKey,
    DateTime CreatedAtUtc
);
