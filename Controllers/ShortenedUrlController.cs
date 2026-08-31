using smaller.Http.Requests;
using smaller.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace smaller.Controllers;

[ApiController]
[Route("")]
public class ShortenedUrlController(
    UrlShorteningService urlShorteningService,
    QrCodeService qrCodeService) : Controller
{
    private readonly UrlShorteningService _urlShorteningService = urlShorteningService;
    private readonly QrCodeService _qrCodeService = qrCodeService;

    [HttpGet("api")]
    public IActionResult ApiRoot()
    {
        return Ok(new { message = "API is running" });
    }

    [HttpGet("api/links")]
    public async Task<IActionResult> GetAllShortenedUrls()
    {
        var baseUrl = GetBaseUrl();
        var result = await _urlShorteningService.GetAllUrlsAsync(baseUrl);
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
        var result = await _urlShorteningService.GetAnalyticsAsync(code, baseUrl);
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
    public async Task<IActionResult> DeleteShortenedUrl(string code)
    {
        var baseUrl = GetBaseUrl();
        var result = await _urlShorteningService.DeleteShortUrlAsync(code, baseUrl);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPost("api/shorten")]
    [EnableRateLimiting("shorten-policy")]
    public async Task<IActionResult> Shorten([FromBody] ShortenUrlRequest request)
    {
        if (!Uri.IsWellFormedUriString(request.Url, UriKind.Absolute))
        {
            return BadRequest("Invalid URL.");
        }

        try
        {
            var baseUrl = GetBaseUrl();
            var result = await _urlShorteningService.CreateShortenedUrlAsync(request, baseUrl);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{code}")]
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
}