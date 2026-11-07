using System.Security.Claims;
using smaller.Http.Requests;
using smaller.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace smaller.Controllers;

[ApiController]
[Route("")]
public class ShortenedUrlController(
    IUrlShorteningService urlShorteningService,
    IUrlAnalyticsService urlAnalyticsService,
    QrCodeService qrCodeService) : Controller
{
    private readonly IUrlShorteningService _urlShorteningService = urlShorteningService;
    private readonly IUrlAnalyticsService _urlAnalyticsService = urlAnalyticsService;
    private readonly QrCodeService _qrCodeService = qrCodeService;

    [HttpGet("api")]
    public IActionResult ApiRoot()
    {
        return Ok(new { message = "API is running" });
    }

    [HttpGet("api/links")]
    [Authorize]
    public async Task<IActionResult> GetAllShortenedUrls([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var baseUrl = GetBaseUrl();
        var role = GetUserRole();
        var result = await _urlShorteningService.GetUserUrlsAsync(baseUrl, userId.Value, role, page, pageSize);
        return Ok(result);
    }

    [HttpGet("api/links/{code}")]
    public async Task<IActionResult> GetShortenedUrl(string code)
    {
        var baseUrl = GetBaseUrl();
        var result = await _urlShorteningService.GetShortUrlAsync(code, baseUrl);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("api/links/{code}/analytics")]
    public async Task<IActionResult> GetUrlAnalytics(string code)
    {
        var baseUrl = GetBaseUrl();
        var result = await _urlAnalyticsService.GetAnalyticsAsync(code, baseUrl);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("api/links/{code}/qrcode")]
    public async Task<IActionResult> GetQrCode(string code)
    {
        var baseUrl = GetBaseUrl();
        var result = await _urlShorteningService.GetShortUrlAsync(code, baseUrl);
        if (result == null) return NotFound();

        var pngBytes = _qrCodeService.GenerateQrCodePng(result.ShortUrl);
        return File(pngBytes, "image/png", $"qrcode-{code}.png");
    }

    [HttpDelete("api/links/{code}")]
    [Authorize]
    public async Task<IActionResult> DeleteShortenedUrl(string code)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var baseUrl = GetBaseUrl();
        var role = GetUserRole();

        try
        {
            var result = await _urlShorteningService.DeleteShortUrlAsync(code, baseUrl, userId.Value, role);
            if (result == null) return NotFound();
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }

    [HttpPost("api/shorten")]
    [EnableRateLimiting("shorten-policy")]
    public async Task<IActionResult> Shorten([FromBody] ShortenUrlRequest request)
    {
        try
        {
            var baseUrl = GetBaseUrl();
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid? userId = Guid.TryParse(userIdClaim, out var parsedId) ? parsedId : null;

            var result = await _urlShorteningService.CreateShortenedUrlAsync(request, baseUrl, userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{code}")]
    [EnableRateLimiting("redirect-policy")]
    public async Task<IActionResult> RedirectToLongUrl(string code)
    {
        var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers.UserAgent.ToString();

        var longUrl = await _urlShorteningService.GetLongUrlAsync(code, ipAddress, userAgent);
        if (longUrl == null)
        {
            return NotFound();
        }
        return Redirect(longUrl);
    }

    private string GetBaseUrl()
    {
        var domain = Environment.GetEnvironmentVariable("DOMAIN_NAME") ?? Request.Host.Value;
        return $"{Request.Scheme}://{domain}";
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }

    private string? GetUserRole()
    {
        return User.FindFirstValue(ClaimTypes.Role);
    }
}