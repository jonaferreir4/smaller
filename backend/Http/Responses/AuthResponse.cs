namespace smaller.Http.Responses;

public record AuthResponse(string Token, string Email, string Role, string Plan);
