using System.Security.Claims;
using smaller.Http.Requests;
using smaller.Http.Responses;
using smaller.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace smaller.Controllers;

[ApiController]
[Route("api/keys")]
[Authorize]
public class ApiKeyController(ApiKeyService apiKeyService) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<ApiKeyResponse>> CreateApiKey([FromBody] CreateApiKeyRequest request)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        try
        {
            var result = await apiKeyService.CreateApiKeyAsync(userId.Value, request.Name);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    public async Task<ActionResult<List<ApiKeyResponse>>> GetUserApiKeys()
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var result = await apiKeyService.GetUserApiKeysAsync(userId.Value);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> RevokeApiKey(Guid id)
    {
        var userId = GetUserId();
        if (userId == null) return Unauthorized();

        var success = await apiKeyService.RevokeApiKeyAsync(userId.Value, id);
        if (!success) return NotFound();

        return NoContent();
    }

    private Guid? GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(claim, out var id) ? id : null;
    }
}
