using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;

namespace smaller.Services;

public static partial class SecurityValidator
{
    [GeneratedRegex(@"^[a-zA-Z0-9_-]{3,30}$", RegexOptions.Compiled)]
    private static partial Regex CustomCodeRegex();

    public static bool IsValidUrl(string url, out string errorMessage)
    {
        errorMessage = string.Empty;

        if (string.IsNullOrWhiteSpace(url))
        {
            errorMessage = "URL cannot be empty.";
            return false;
        }

        if (url.Length > 2048)
        {
            errorMessage = "URL exceeds maximum allowed length of 2048 characters.";
            return false;
        }

        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            errorMessage = "Invalid URL format.";
            return false;
        }

        if (uri.Scheme != Uri.UriSchemeHttp && uri.Scheme != Uri.UriSchemeHttps)
        {
            errorMessage = "Only HTTP and HTTPS protocols are allowed.";
            return false;
        }

        if (IsPrivateOrLoopbackHost(uri.Host))
        {
            errorMessage = "URLs pointing to localhost, private networks, or internal IP addresses are prohibited (SSRF Protection).";
            return false;
        }

        return true;
    }

    private static readonly HashSet<string> ReservedSlugs = new(StringComparer.OrdinalIgnoreCase)
    {
        "api", "dashboard", "profile", "admin", "login", "register", "healthz", "assets", "swagger", "docs", "termos", "privacidade", "terms", "privacy"
    };

    public static bool IsValidCustomCode(string code, out string errorMessage)
    {
        errorMessage = string.Empty;

        if (string.IsNullOrWhiteSpace(code))
        {
            errorMessage = "Custom code cannot be empty.";
            return false;
        }

        var trimmed = code.Trim();

        if (ReservedSlugs.Contains(trimmed))
        {
            errorMessage = $"The custom slug '{trimmed}' is reserved by the system.";
            return false;
        }

        if (!CustomCodeRegex().IsMatch(trimmed))
        {
            errorMessage = "Custom code must be 3-30 characters long and contain only alphanumeric characters, hyphens, or underscores.";
            return false;
        }

        return true;
    }

    private static bool IsPrivateOrLoopbackHost(string host)
    {
        if (string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(host, "127.0.0.1", StringComparison.Ordinal) ||
            string.Equals(host, "::1", StringComparison.Ordinal) ||
            string.Equals(host, "0.0.0.0", StringComparison.Ordinal))
        {
            return true;
        }

        if (IPAddress.TryParse(host, out var ip))
        {
            return IsPrivateIP(ip);
        }

        // Try to resolve hostname to IP to catch hidden internal hosts
        try
        {
            var addresses = Dns.GetHostAddresses(host);
            foreach (var addr in addresses)
            {
                if (IsPrivateIP(addr)) return true;
            }
        }
        catch
        {
            // DNS resolution failure is safe to ignore here
        }

        return false;
    }

    private static bool IsPrivateIP(IPAddress ip)
    {
        if (IPAddress.IsLoopback(ip)) return true;

        if (ip.IsIPv4MappedToIPv6)
        {
            ip = ip.MapToIPv4();
        }

        if (ip.AddressFamily == AddressFamily.InterNetwork)
        {
            var bytes = ip.GetAddressBytes();

            // 10.0.0.0/8
            if (bytes[0] == 10) return true;

            // 172.16.0.0/12
            if (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) return true;

            // 192.168.0.0/16
            if (bytes[0] == 192 && bytes[1] == 168) return true;

            // 169.254.0.0/16 (Link-local)
            if (bytes[0] == 169 && bytes[1] == 254) return true;

            // 100.64.0.0/10 (Carrier-grade NAT)
            if (bytes[0] == 100 && bytes[1] >= 64 && bytes[1] <= 127) return true;

            // 0.0.0.0/8
            if (bytes[0] == 0) return true;
        }
        else if (ip.AddressFamily == AddressFamily.InterNetworkV6)
        {
            if (ip.IsIPv6LinkLocal || ip.IsIPv6SiteLocal) return true;

            // fc00::/7 (Unique Local Address)
            var bytes = ip.GetAddressBytes();
            if ((bytes[0] & 0xfe) == 0xfc) return true;
        }

        return false;
    }
}
