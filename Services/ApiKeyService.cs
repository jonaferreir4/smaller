using System.Security.Cryptography;
using System.Text;
using smaller.Data;
using smaller.Http.Responses;
using smaller.Models;
using Microsoft.EntityFrameworkCore;

namespace smaller.Services;

public class ApiKeyService(ApplicationDbContext context)
{
    public async Task<ApiKeyResponse> CreateApiKeyAsync(Guid userId, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new InvalidOperationException("API Key name is required.");
        }

        // Generate random 32 byte key formatted as sk_live_<base64url>
        var randomBytes = RandomNumberGenerator.GetBytes(32);
        var rawKey = $"sk_live_{Convert.ToHexString(randomBytes).ToLowerInvariant()}";
        var prefix = rawKey[..12]; // e.g., sk_live_a1b2
        var hash = ComputeHash(rawKey);

        var apiKey = new ApiKey
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name.Trim(),
            KeyPrefix = prefix,
            KeyHash = hash,
            CreatedAtUtc = DateTime.UtcNow,
            IsActive = true
        };

        context.ApiKeys.Add(apiKey);
        await context.SaveChangesAsync();

        return new ApiKeyResponse(
            apiKey.Id,
            apiKey.Name,
            apiKey.KeyPrefix,
            SecretKey: rawKey,
            apiKey.CreatedAtUtc
        );
    }

    public async Task<List<ApiKeyResponse>> GetUserApiKeysAsync(Guid userId)
    {
        var keys = await context.ApiKeys
            .AsNoTracking()
            .Where(k => k.UserId == userId && k.IsActive)
            .OrderByDescending(k => k.CreatedAtUtc)
            .ToListAsync();

        return keys.Select(k => new ApiKeyResponse(
            k.Id,
            k.Name,
            k.KeyPrefix,
            SecretKey: null, // Never return raw key on list
            k.CreatedAtUtc
        )).ToList();
    }

    public async Task<bool> RevokeApiKeyAsync(Guid userId, Guid keyId)
    {
        var key = await context.ApiKeys.FirstOrDefaultAsync(k => k.Id == keyId && k.UserId == userId);
        if (key == null) return false;

        key.IsActive = false;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<User?> ValidateApiKeyAsync(string rawKey)
    {
        if (string.IsNullOrWhiteSpace(rawKey)) return null;

        var hash = ComputeHash(rawKey.Trim());

        var apiKey = await context.ApiKeys
            .AsNoTracking()
            .Include(k => k.User)
            .FirstOrDefaultAsync(k => k.KeyHash == hash && k.IsActive);

        if (apiKey == null || (apiKey.ExpiresAtUtc.HasValue && apiKey.ExpiresAtUtc.Value <= DateTime.UtcNow))
        {
            return null;
        }

        return apiKey.User;
    }

    private static string ComputeHash(string rawKey)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawKey));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
