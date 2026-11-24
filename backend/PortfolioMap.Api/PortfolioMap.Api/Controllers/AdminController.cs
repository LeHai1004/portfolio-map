using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Admin;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Services;
using System.Security.Claims;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _admin;

    public AdminController(IAdminService admin)
    {
        _admin = admin;
    }

    // ── 1. GET /api/admin/projects ──────────────────────────────────────────

    /// <summary>Danh sách tất cả dự án (kể cả Hidden), có phân trang.</summary>
    [HttpGet("projects")]
    [ProducesResponseType(typeof(PagedResult<AdminProjectDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<AdminProjectDto>>> GetProjects(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var result = await _admin.GetProjectsAsync(page, pageSize, ct);
        return Ok(result);
    }

    // ── 2. PUT /api/admin/projects/{id}/status ──────────────────────────────

    /// <summary>Thay đổi trạng thái dự án (Active / Hidden).</summary>
    [HttpPut("projects/{id:int}/status")]
    [ProducesResponseType(typeof(AdminProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminProjectDto>> UpdateProjectStatus(
        int id,
        [FromBody] UpdateProjectStatusRequest request,
        CancellationToken ct = default)
    {
        var result = await _admin.UpdateProjectStatusAsync(id, request.Status, ct);
        return result.Status switch
        {
            ProjectResultStatus.Ok => Ok(result.Value),
            ProjectResultStatus.Invalid => BadRequest(result.Error),
            ProjectResultStatus.NotFound => NotFound(result.Error),
            _ => BadRequest(result.Error)
        };
    }

    // ── 3. GET /api/admin/users ─────────────────────────────────────────────

    /// <summary>Danh sách tất cả người dùng, có phân trang.</summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(PagedResult<AdminUserDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<AdminUserDto>>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var result = await _admin.GetUsersAsync(page, pageSize, ct);
        return Ok(result);
    }

    // ── 4. PUT /api/admin/users/{id}/lock ──────────────────────────────────

    /// <summary>Khóa hoặc mở khóa tài khoản người dùng.</summary>
    [HttpPut("users/{id}/lock")]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<AdminUserDto>> LockUser(
        string id,
        [FromBody] LockUserRequest request,
        CancellationToken ct = default)
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var callerEmail = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var result = await _admin.LockUserAsync(
            id,
            request.IsLocked,
            callerId,
            callerEmail,
            ct);

        return result.Status switch
        {
            ProjectResultStatus.Ok => Ok(result.Value),
            ProjectResultStatus.Invalid => BadRequest(result.Error),
            ProjectResultStatus.NotFound => NotFound(result.Error),
            _ => BadRequest(result.Error)
        };
    }
}
