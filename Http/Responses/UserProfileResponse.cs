namespace smaller.Http.Responses;

public record UserProfileResponse(
    Guid Id,
    string Email,
    string Role,
    string Plan,
    int TotalLinksCreated,
    DateTime CreatedAtUtc
);
