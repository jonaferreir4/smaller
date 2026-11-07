using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using smaller.Data;
using smaller.Http.Requests;
using smaller.Http.Responses;
using smaller.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace smaller.Services;

public class AuthService(ApplicationDbContext context, IConfiguration configuration, ICacheService? cacheService = null)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new InvalidOperationException("Email and password are required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();

        if (await context.Users.AsNoTracking().AnyAsync(u => u.Email == normalizedEmail))
        {
            throw new InvalidOperationException("Email is already registered.");
        }

        if (request.Password.Length < 8)
        {
            throw new InvalidOperationException("Password must be at least 8 characters long.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            Role = "User",
            Plan = "Free",
            CreatedAtUtc = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();

        var token = GenerateJwtToken(user);

        return new AuthResponse(token, user.Email, user.Role, user.Plan);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new InvalidOperationException("Email and password are required.");
        }

        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == normalizedEmail);

        if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        var token = GenerateJwtToken(user);

        return new AuthResponse(token, user.Email, user.Role, user.Plan);
    }

    public async Task<UserProfileResponse?> GetUserProfileAsync(Guid userId)
    {
        var user = await context.Users
            .AsNoTracking()
            .Include(u => u.ShortenedUrls)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return null;

        return new UserProfileResponse(
            user.Id,
            user.Email,
            user.Role,
            user.Plan,
            user.ShortenedUrls.Count,
            user.CreatedAtUtc
        );
    }

    public async Task<bool> DeleteAccountAsync(Guid userId, string password)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException("Password is required.");
        }

        var user = await context.Users
            .Include(u => u.ShortenedUrls)
            .Include(u => u.ApiKeys)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return false;

        if (!PasswordHasher.VerifyPassword(password, user.PasswordHash))
        {
            throw new InvalidOperationException("Senha incorreta. Confirme sua senha atual para excluir a conta.");
        }

        if (cacheService != null)
        {
            foreach (var url in user.ShortenedUrls)
            {
                await cacheService.RemoveAsync(url.Code);
            }
        }

        context.ShortenedUrls.RemoveRange(user.ShortenedUrls);
        context.ApiKeys.RemoveRange(user.ApiKeys);
        context.Users.Remove(user);

        await context.SaveChangesAsync();
        return true;
    }

    public string GenerateJwtToken(User user)
    {
        var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET") 
            ?? configuration["JWT_SECRET"];

        if (string.IsNullOrWhiteSpace(jwtSecret) || Encoding.UTF8.GetByteCount(jwtSecret) < 32)
        {
            throw new InvalidOperationException("JWT_SECRET is missing or does not meet the minimum length requirement (32 bytes).");
        }
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var issuer = Environment.GetEnvironmentVariable("JWT_ISSUER") 
            ?? configuration["JWT_ISSUER"] 
            ?? "smaller-api";
        var audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE") 
            ?? configuration["JWT_AUDIENCE"] 
            ?? "smaller-client";

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("plan", user.Plan),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddDays(30),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
