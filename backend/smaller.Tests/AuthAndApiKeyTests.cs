using smaller.Data;
using smaller.Http.Requests;
using smaller.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace smaller.Tests;

public class AuthAndApiKeyTests
{
    private readonly ApplicationDbContext _dbContext;
    private readonly AuthService _authService;
    private readonly ApiKeyService _apiKeyService;

    public AuthAndApiKeyTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ApplicationDbContext(options);

        var configValues = new Dictionary<string, string?>
        {
            {"JWT_SECRET", "SuperSecretTestKeyForSmallerSaaS2026!"},
            {"JWT_ISSUER", "smaller-api"},
            {"JWT_AUDIENCE", "smaller-client"}
        };
        IConfiguration config = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();

        _authService = new AuthService(_dbContext, config);
        _apiKeyService = new ApiKeyService(_dbContext);
    }

    [Fact]
    public async Task RegisterAsync_ShouldCreateUserAndReturnJwtToken()
    {
        // Arrange
        var request = new RegisterRequest("user@example.com", "Password123!");

        // Act
        var response = await _authService.RegisterAsync(request);

        // Assert
        Assert.NotNull(response);
        Assert.Equal("user@example.com", response.Email);
        Assert.Equal("User", response.Role);
        Assert.Equal("Free", response.Plan);
        Assert.False(string.IsNullOrWhiteSpace(response.Token));
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnJwtToken()
    {
        // Arrange
        var regRequest = new RegisterRequest("loginuser@example.com", "MySecretPass");
        await _authService.RegisterAsync(regRequest);

        // Act
        var loginRequest = new LoginRequest("loginuser@example.com", "MySecretPass");
        var response = await _authService.LoginAsync(loginRequest);

        // Assert
        Assert.NotNull(response);
        Assert.Equal("loginuser@example.com", response.Email);
        Assert.False(string.IsNullOrWhiteSpace(response.Token));
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldThrowException()
    {
        // Arrange
        var regRequest = new RegisterRequest("wrongpass@example.com", "CorrectPassword");
        await _authService.RegisterAsync(regRequest);

        // Act & Assert
        var loginRequest = new LoginRequest("wrongpass@example.com", "WrongPassword");
        await Assert.ThrowsAsync<InvalidOperationException>(() => _authService.LoginAsync(loginRequest));
    }

    [Fact]
    public async Task CreateApiKeyAsync_ShouldGenerateKeyAndReturnSecretOnce()
    {
        // Arrange
        var regResponse = await _authService.RegisterAsync(new RegisterRequest("apikeyuser@example.com", "Pass123!"));
        var user = await _dbContext.Users.FirstAsync(u => u.Email == "apikeyuser@example.com");

        // Act
        var keyResponse = await _apiKeyService.CreateApiKeyAsync(user.Id, "Production CLI Key");

        // Assert
        Assert.NotNull(keyResponse);
        Assert.Equal("Production CLI Key", keyResponse.Name);
        Assert.StartsWith("sk_live_", keyResponse.KeyPrefix);
        Assert.NotNull(keyResponse.SecretKey);
        Assert.StartsWith("sk_live_", keyResponse.SecretKey);

        // Validate Key Hash
        var validatedUser = await _apiKeyService.ValidateApiKeyAsync(keyResponse.SecretKey);
        Assert.NotNull(validatedUser);
        Assert.Equal(user.Id, validatedUser.Id);
    }

    [Fact]
    public async Task DeleteAccountAsync_WithCorrectPassword_ShouldDeleteUserAndAssociatedData()
    {
        // Arrange
        var email = "delete_me@example.com";
        var password = "SecurePassword123!";
        await _authService.RegisterAsync(new RegisterRequest(email, password));
        var user = await _dbContext.Users.FirstAsync(u => u.Email == email);
        await _apiKeyService.CreateApiKeyAsync(user.Id, "Key to be deleted");

        // Act
        var result = await _authService.DeleteAccountAsync(user.Id, password);

        // Assert
        Assert.True(result);
        var deletedUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
        Assert.Null(deletedUser);
        var remainingKeys = await _dbContext.ApiKeys.Where(k => k.UserId == user.Id).ToListAsync();
        Assert.Empty(remainingKeys);
    }

    [Fact]
    public async Task DeleteAccountAsync_WithIncorrectPassword_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var email = "wrong_delete@example.com";
        var password = "SecurePassword123!";
        await _authService.RegisterAsync(new RegisterRequest(email, password));
        var user = await _dbContext.Users.FirstAsync(u => u.Email == email);

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _authService.DeleteAccountAsync(user.Id, "WrongPassword123!"));
        Assert.Contains("Senha incorreta", ex.Message);
    }

    [Fact]
    public async Task DeleteAccountAsync_WithNonExistentUser_ShouldReturnFalse()
    {
        // Act
        var result = await _authService.DeleteAccountAsync(Guid.NewGuid(), "AnyPassword");

        // Assert
        Assert.False(result);
    }
}
