using smaller.Http.Requests;
using smaller.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace smaller.Controllers;

[ApiController]
[Route("")]
public class ShortenedUrlController(UrlShorteningService urlShorteningService) : Controller
{
    private readonly UrlShorteningService _urlShorteningService = urlShorteningService;

    [HttpGet("api")]
    public IActionResult ApiRoot()
    {
        return Ok(new { message = "API is running" });
    }

    [HttpGet("api/links")]
    public async Task<IActionResult> GetAllShortenedUrls()
    {
        var result = await _urlShorteningService.GetAllUrlsAsync();
        return Ok(result);
    }

    [HttpGet("api/links/{code}")]
    public async Task<IActionResult> GetShortenedUrl(string code)
    {
        var result = await _urlShorteningService.GetShortUrlAsync(code);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("api/links/{code}")]
    public async Task<IActionResult> DeleteShortenedUrl(string code)
    {
        var result = await _urlShorteningService.DeleteShortUrlAsync(code);
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
            var domain = Environment.GetEnvironmentVariable("DOMAIN_NAME") ?? Request.Host.Value;
            var baseUrl = $"{Request.Scheme}://{domain}";
            var result = await _urlShorteningService.CreateShortenedUrlAsync(request.Url, baseUrl);
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


}