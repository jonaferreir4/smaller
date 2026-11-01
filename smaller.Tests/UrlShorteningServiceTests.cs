using smaller.Data;
using smaller.Http.Requests;
using smaller.Models;
using smaller.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace smaller.Tests;

public class UrlShorteningServiceTests
{
    private readonly ApplicationDbContext _dbContext;
    private readonly RedisCacheService _redisCacheService;
    private readonly AccessLogQueue _accessLogQueue;
    private readonly UrlShorteningService _service;

    public UrlShorteningServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ApplicationDbContext(options);

        var mockDistributedCache = new Mock<IDistributedCache>();
        var memoryCacheOptions = new MemoryCacheOptions();
        var memoryCache = new MemoryCache(memoryCacheOptions);
        var mockCacheLogger = new Mock<ILogger<RedisCacheService>>();

        _redisCacheService = new RedisCacheService(mockDistributedCache.Object, memoryCache, mockCacheLogger.Object);
        _accessLogQueue = new AccessLogQueue();
        _service = new UrlShorteningService(_dbContext, _redisCacheService, _accessLogQueue);
    }

    [Fact]
    public async Task CreateShortenedUrlAsync_ShouldCreateValidShortUrl()
    {
        // Arrange
        var request = new ShortenUrlRequest("https://example.com/test-url");
        var baseUrl = "http://short.local";

        // Act
        var result = await _service.CreateShortenedUrlAsync(request, baseUrl);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("https://example.com/test-url", result.OriginalUrl);
        Assert.StartsWith(baseUrl, result.ShortUrl);
        Assert.Equal(7, result.Code.Length);
        Assert.True(result.IsActive);
    }

    [Fact]
    public async Task CreateShortenedUrlAsync_WithShopeeEcommerceUrl_ShouldSucceed()
    {
        // Arrange
        var shopeeUrl = "http://shopee.com.br/KIT-10-CUECAS-BOX-BOXER-QUALIDADE-EXTREMA-M-G-GG-PRONTA-ENTREGA-i.123456789.987654321";
        var request = new ShortenUrlRequest(shopeeUrl);
        var baseUrl = "http://short.local";

        // Act
        var result = await _service.CreateShortenedUrlAsync(request, baseUrl);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(shopeeUrl, result.OriginalUrl);
        Assert.StartsWith(baseUrl, result.ShortUrl);
        Assert.Equal(7, result.Code.Length);
    }

    [Fact]
    public async Task CreateShortenedUrlAsync_WithCustomCode_ShouldUseCustomCode()
    {
        // Arrange
        var request = new ShortenUrlRequest("https://example.com/custom", CustomCode: "my-alias");
        var baseUrl = "http://short.local";

        // Act
        var result = await _service.CreateShortenedUrlAsync(request, baseUrl);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("my-alias", result.Code);
        Assert.True(result.IsCustom);
    }

    [Fact]
    public async Task CreateShortenedUrlAsync_WithPrivateIpUrl_ShouldThrowException_SSRFGuard()
    {
        // Arrange
        var request = new ShortenUrlRequest("http://127.0.0.1/admin");
        var baseUrl = "http://short.local";

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.CreateShortenedUrlAsync(request, baseUrl));

        Assert.Contains("SSRF Protection", ex.Message);
    }

    [Fact]
    public async Task CreateShortenedUrlAsync_WithInvalidCustomCode_ShouldThrowException()
    {
        // Arrange
        var request = new ShortenUrlRequest("https://example.com", CustomCode: "invalid code!");
        var baseUrl = "http://short.local";

        // Act & Assert
        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _service.CreateShortenedUrlAsync(request, baseUrl));

        Assert.Contains("Custom code must be 3-30 characters", ex.Message);
    }

    [Fact]
    public async Task GetLongUrlAsync_WhenExpired_ShouldReturnNull()
    {
        // Arrange
        var request = new ShortenUrlRequest(
            "https://example.com/expired",
            ExpiresAtUtc: DateTime.UtcNow.AddHours(-1)
        );
        var created = await _service.CreateShortenedUrlAsync(request, "http://short.local");

        // Act
        var result = await _service.GetLongUrlAsync(created.Code, "127.0.0.1", "TestAgent");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetLongUrlAsync_WhenMaxClicksReached_ShouldReturnNull()
    {
        // Arrange
        var request = new ShortenUrlRequest("https://example.com/max-clicks", MaxClicks: 1);
        var created = await _service.CreateShortenedUrlAsync(request, "http://short.local");

        // Simulate 1 click
        var entity = await _dbContext.ShortenedUrls.FirstAsync(s => s.Code == created.Code);
        entity.Click = 1;
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _service.GetLongUrlAsync(created.Code, "127.0.0.1", "TestAgent");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task DeleteShortUrlAsync_WhenUserDoesNotOwnLink_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var attackerId = Guid.NewGuid();
        var request = new ShortenUrlRequest("https://example.com/protected-link");
        var created = await _service.CreateShortenedUrlAsync(request, "http://short.local", ownerId);

        // Act & Assert
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            _service.DeleteShortUrlAsync(created.Code, "http://short.local", attackerId, "User"));
    }

    [Fact]
    public async Task DeleteShortUrlAsync_WhenUserOwnsLink_ShouldSucceed()
    {
        // Arrange
        var ownerId = Guid.NewGuid();
        var request = new ShortenUrlRequest("https://example.com/my-link");
        var created = await _service.CreateShortenedUrlAsync(request, "http://short.local", ownerId);

        // Act
        var deleted = await _service.DeleteShortUrlAsync(created.Code, "http://short.local", ownerId, "User");

        // Assert
        Assert.NotNull(deleted);
        Assert.Equal(created.Code, deleted.Code);
        Assert.False(await _dbContext.ShortenedUrls.AnyAsync(s => s.Code == created.Code));
    }

    [Fact]
    public async Task GetUserUrlsAsync_ShouldReturnOnlyUserOwnedLinks()
    {
        // Arrange
        var user1Id = Guid.NewGuid();
        var user2Id = Guid.NewGuid();

        await _service.CreateShortenedUrlAsync(new ShortenUrlRequest("https://example.com/u1-link1"), "http://short.local", user1Id);
        await _service.CreateShortenedUrlAsync(new ShortenUrlRequest("https://example.com/u1-link2"), "http://short.local", user1Id);
        await _service.CreateShortenedUrlAsync(new ShortenUrlRequest("https://example.com/u2-link1"), "http://short.local", user2Id);

        // Act
        var user1Links = await _service.GetUserUrlsAsync("http://short.local", user1Id, "User");

        // Assert
        Assert.Equal(2, user1Links.Count);
        Assert.All(user1Links, l => Assert.Contains("u1-link", l.OriginalUrl));
    }

    [Fact]
    public async Task CreateShortenedUrlAsync_WithCustomSlugUpTo30Chars_ShouldSucceed()
    {
        // Arrange
        var customSlug = "blackfriday-promocao-especial"; // 29 chars
        var request = new ShortenUrlRequest("https://example.com/promo", CustomCode: customSlug);

        // Act
        var result = await _service.CreateShortenedUrlAsync(request, "http://short.local");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(customSlug, result.Code);
        Assert.True(result.IsCustom);
    }

    [Fact]
    public void IsValidCustomCode_WithReservedSlug_ShouldReturnFalse()
    {
        // Arrange
        var reserved = "dashboard";

        // Act
        var isValid = SecurityValidator.IsValidCustomCode(reserved, out var error);

        // Assert
        Assert.False(isValid);
        Assert.Contains("reserved", error, StringComparison.OrdinalIgnoreCase);
    }
}
