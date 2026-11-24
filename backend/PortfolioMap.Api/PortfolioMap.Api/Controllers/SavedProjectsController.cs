using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Company;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Services;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Authorize(Roles = "Company")]
[Route("api/saved-projects")]
public class SavedProjectsController : ControllerBase
{
    private readonly ISavedProjectsService _savedProjects;

    public SavedProjectsController(ISavedProjectsService savedProjects) =>
        _savedProjects = savedProjects;

    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost("{projectId:int}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SaveProject(int projectId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized(new ApiErrorResponse(
                "Chưa đăng nhập hoặc token sai"));
        }

        var result = await _savedProjects.SaveAsync(CurrentUserId, projectId, ct);
        if (!result.IsOk)
        {
            var errors = new Dictionary<string, string[]>
            {
                ["projectId"] = new[] { result.Error?.Message ?? "Dự án không hợp lệ" }
            };
            var error = new ApiErrorResponse(
                result.Error?.Message ?? "Dự án không hợp lệ",
                errors);

            return result.Status switch
            {
                SavedProjectResultStatus.NotFound => NotFound(error),
                SavedProjectResultStatus.Conflict => Conflict(error),
                _ => StatusCode(StatusCodes.Status500InternalServerError, error)
            };
        }

        return StatusCode(StatusCodes.Status201Created,
            new { projectId, savedAt = result.SavedAt });
    }

    [HttpDelete("{projectId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnsaveProject(int projectId, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized(new ApiErrorResponse(
                "Chưa đăng nhập hoặc token sai"));
        }

        var result = await _savedProjects.UnsaveAsync(CurrentUserId, projectId, ct);
        if (result.IsOk) return NoContent();

        return NotFound(new ApiErrorResponse(
            result.Error?.Message ?? "Dự án chưa được lưu",
            new Dictionary<string, string[]>
            {
                ["projectId"] = new[] { result.Error?.Message ?? "Dự án chưa được lưu" }
            }));
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SavedProjectDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<SavedProjectDto>>> GetSavedProjects(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized(new ApiErrorResponse(
                "Chưa đăng nhập hoặc token sai"));
        }

        var result = await _savedProjects.GetAsync(
            CurrentUserId,
            page,
            pageSize,
            ct);
        return Ok(result);
    }
}