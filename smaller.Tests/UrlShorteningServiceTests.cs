using smaller.Data;
using smaller.Http.Requests;
using smaller.Models;
using smaller.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
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

        var mockCache = new Mock<IDistributedCache>();
        var mockCacheLogger = new Mock<ILogger<RedisCacheService>>();
        _redisCacheService = new RedisCacheService(mockCache.Object, mockCacheLogger.Object);

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
}
