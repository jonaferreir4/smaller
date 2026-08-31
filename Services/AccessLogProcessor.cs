using smaller.Data;
using smaller.Models;
using Microsoft.EntityFrameworkCore;

namespace smaller.Services;

public class AccessLogProcessor(
    AccessLogQueue queue,
    IServiceScopeFactory scopeFactory,
    ILogger<AccessLogProcessor> logger) : BackgroundService
{
    private const int BatchSize = 100;
    private static readonly TimeSpan BatchTimeout = TimeSpan.FromSeconds(3);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("AccessLogProcessor background worker started.");

        var buffer = new List<AccessLog>();
        var lastFlushTime = DateTime.UtcNow;

        try
        {
            await foreach (var log in queue.ReadAccessLogsAsync(stoppingToken))
            {
                buffer.Add(log);

                if (buffer.Count >= BatchSize || (DateTime.UtcNow - lastFlushTime) >= BatchTimeout)
                {
                    await FlushBatchAsync(buffer, stoppingToken);
                    lastFlushTime = DateTime.UtcNow;
                }
            }
        }
        catch (OperationCanceledException)
        {
            logger.LogInformation("AccessLogProcessor is shutting down.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error in AccessLogProcessor execution.");
        }
        finally
        {
            if (buffer.Count > 0)
            {
                await FlushBatchAsync(buffer, CancellationToken.None);
            }
        }
    }

    private async Task FlushBatchAsync(List<AccessLog> logs, CancellationToken cancellationToken)
    {
        if (logs.Count == 0) return;

        try
        {
            using var scope = scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            foreach (var log in logs)
            {
                var uaInfo = UserAgentParser.Parse(log.UserAgent);
                log.Browser = uaInfo.Browser;
                log.OperatingSystem = uaInfo.OperatingSystem;
                log.DeviceType = uaInfo.DeviceType;
            }

            dbContext.AccessLogs.AddRange(logs);

            var counts = logs.GroupBy(l => l.ShortenedUrlId).ToDictionary(g => g.Key, g => g.Count());
            var urlIds = counts.Keys.ToList();

            var urls = await dbContext.ShortenedUrls
                .Where(u => urlIds.Contains(u.Id))
                .ToListAsync(cancellationToken);

            foreach (var url in urls)
            {
                if (counts.TryGetValue(url.Id, out var clickCount))
                {
                    url.Click += clickCount;
                }
            }

            await dbContext.SaveChangesAsync(cancellationToken);
            logger.LogDebug("Flushed {Count} access logs to database.", logs.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to flush {Count} access logs to database.", logs.Count);
        }
        finally
        {
            logs.Clear();
        }
    }
}
