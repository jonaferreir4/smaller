using System.Threading.Channels;
using smaller.Models;

namespace smaller.Services;

public class AccessLogQueue
{
    private readonly Channel<AccessLog> _channel = Channel.CreateBounded<AccessLog>(new BoundedChannelOptions(10_000)
    {
        SingleReader = true,
        FullMode = BoundedChannelFullMode.DropOldest
    });

    public ValueTask QueueAccessLogAsync(AccessLog log)
    {
        _channel.Writer.TryWrite(log);
        return ValueTask.CompletedTask;
    }

    public ChannelReader<AccessLog> Reader => _channel.Reader;

    public IAsyncEnumerable<AccessLog> ReadAccessLogsAsync(CancellationToken cancellationToken)
    {
        return _channel.Reader.ReadAllAsync(cancellationToken);
    }
}
