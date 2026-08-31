using System.Threading.Channels;
using smaller.Models;

namespace smaller.Services;

public class AccessLogQueue
{
    private readonly Channel<AccessLog> _channel = Channel.CreateUnbounded<AccessLog>(new UnboundedChannelOptions
    {
        SingleReader = true
    });

    public ValueTask QueueAccessLogAsync(AccessLog log)
    {
        return _channel.Writer.WriteAsync(log);
    }

    public IAsyncEnumerable<AccessLog> ReadAccessLogsAsync(CancellationToken cancellationToken)
    {
        return _channel.Reader.ReadAllAsync(cancellationToken);
    }
}
