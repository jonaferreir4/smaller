namespace smaller.Services;

public record UserAgentInfo(string Browser, string OperatingSystem, string DeviceType);

public static class UserAgentParser
{
    public static UserAgentInfo Parse(string? userAgent)
    {
        if (string.IsNullOrWhiteSpace(userAgent))
        {
            return new UserAgentInfo("Unknown", "Unknown", "Desktop");
        }

        var ua = userAgent.ToLowerInvariant();

        // Device Type
        var deviceType = "Desktop";
        if (ua.Contains("mobile") || ua.Contains("android") || ua.Contains("iphone") || ua.Contains("ipod"))
        {
            deviceType = "Mobile";
        }
        else if (ua.Contains("ipad") || ua.Contains("tablet"))
        {
            deviceType = "Tablet";
        }

        // Operating System
        var os = "Unknown";
        if (ua.Contains("windows")) os = "Windows";
        else if (ua.Contains("mac os") || ua.Contains("macintosh")) os = "macOS";
        else if (ua.Contains("android")) os = "Android";
        else if (ua.Contains("iphone") || ua.Contains("ipad")) os = "iOS";
        else if (ua.Contains("linux")) os = "Linux";

        // Browser
        var browser = "Unknown";
        if (ua.Contains("edg/")) browser = "Edge";
        else if (ua.Contains("chrome/")) browser = "Chrome";
        else if (ua.Contains("safari/") && !ua.Contains("chrome/")) browser = "Safari";
        else if (ua.Contains("firefox/")) browser = "Firefox";
        else if (ua.Contains("opera/") || ua.Contains("opr/")) browser = "Opera";

        return new UserAgentInfo(browser, os, deviceType);
    }
}
