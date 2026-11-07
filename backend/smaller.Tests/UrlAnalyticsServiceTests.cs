using smaller.Data;
using smaller.Models;
using smaller.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace smaller.Tests;

public class UrlAnalyticsServiceTests
{
    private readonly ApplicationDbContext _dbContext;
    private readonly UrlAnalyticsService _analyticsService;

    public UrlAnalyticsServiceTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new ApplicationDbContext(options);
        _analyticsService = new UrlAnalyticsService(_dbContext);
    }

    [Fact]
    public async Task GetAnalyticsAsync_WhenUrlExists_ShouldReturnAggregatedMetrics()
    {
        // Arrange
        var urlId = Guid.NewGuid();
        var shortenedUrl = new ShortenedUrl
        {
            Id = urlId,
            Code = "analy01",
            ShortUrl = "http://short.local/analy01",
            LongUrl = "https://example.com/target",
            Click = 3,
            IsActive = true,
            CreatedOnUtc = DateTime.UtcNow
        };

        var log1 = new AccessLog
        {
            Id = Guid.NewGuid(),
            ShortenedUrlId = urlId,
            IpAdress = "192.168.1.10",
            UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            Browser = "Chrome",
            OperatingSystem = "Windows",
            DeviceType = "Desktop",
            AccessDate = DateTime.UtcNow
        };

        var log2 = new AccessLog
        {
            Id = Guid.NewGuid(),
            ShortenedUrlId = urlId,
            IpAdress = "192.168.1.11",
            UserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
            Browser = "Safari",
            OperatingSystem = "iOS",
            DeviceType = "Mobile",
            AccessDate = DateTime.UtcNow
        };

        _dbContext.ShortenedUrls.Add(shortenedUrl);
        _dbContext.AccessLogs.AddRange(log1, log2);
        await _dbContext.SaveChangesAsync();

        // Act
        var result = await _analyticsService.GetAnalyticsAsync("analy01", "http://short.local");

        // Assert
        Assert.NotNull(result);
        Assert.Equal("analy01", result.Code);
        Assert.Equal("https://example.com/target", result.OriginalUrl);
        Assert.Equal(3, result.TotalClicks);
        Assert.Equal(1, result.TopBrowsers["Chrome"]);
        Assert.Equal(1, result.TopBrowsers["Safari"]);
        Assert.Equal(1, result.TopOperatingSystems["Windows"]);
        Assert.Equal(1, result.TopOperatingSystems["iOS"]);
        Assert.Equal(1, result.TopDeviceTypes["Desktop"]);
        Assert.Equal(1, result.TopDeviceTypes["Mobile"]);
    }

    [Fact]
    public async Task GetAnalyticsAsync_WhenUrlDoesNotExistOrInactive_ShouldReturnNull()
    {
        // Act
        var resultNonExistent = await _analyticsService.GetAnalyticsAsync("nonexistent", "http://short.local");

        // Arrange inactive
        var inactiveUrl = new ShortenedUrl
        {
            Id = Guid.NewGuid(),
            Code = "inact01",
            ShortUrl = "http://short.local/inact01",
            LongUrl = "https://example.com",
            IsActive = false,
            CreatedOnUtc = DateTime.UtcNow
        };
        _dbContext.ShortenedUrls.Add(inactiveUrl);
        await _dbContext.SaveChangesAsync();

        var resultInactive = await _analyticsService.GetAnalyticsAsync("inact01", "http://short.local");

        // Assert
        Assert.Null(resultNonExistent);
        Assert.Null(resultInactive);
    }
}
