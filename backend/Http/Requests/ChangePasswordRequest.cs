namespace smaller.Http.Requests;

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);
