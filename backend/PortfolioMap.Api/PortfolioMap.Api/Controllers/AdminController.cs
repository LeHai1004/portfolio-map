using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Admin;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Mock;
using System.Security.Claims;

namespace PortfolioMap.Api.Controllers;

/// <summary>
/// HỢP ĐỒNG API Admin (trả dữ liệu mẫu trong bộ nhớ, chưa truy cập DB).
/// TODO khi nối DB: thay MockAdminData bằng IAdminService, xóa thư mục Mock/MockAdminData.cs.
/// </summary>
[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    // ── 1. GET /api/admin/projects ──────────────────────────────────────────

    /// <summary>Danh sách tất cả dự án (kể cả Hidden), có phân trang.</summary>
    [HttpGet("projects")]
    [ProducesResponseType(typeof(PagedResult<AdminProjectDto>), StatusCodes.Status200OK)]
    public ActionResult<PagedResult<AdminProjectDto>> GetProjects(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var all = MockAdminData.Projects
            .OrderByDescending(p => p.CreatedAt)
            .ToList();

        var items = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Ok(new PagedResult<AdminProjectDto>(items, page, pageSize, all.Count));
    }

    // ── 2. PUT /api/admin/projects/{id}/status ──────────────────────────────

    /// <summary>Thay đổi trạng thái dự án (Active / Hidden).</summary>
    [HttpPut("projects/{id:int}/status")]
    [ProducesResponseType(typeof(AdminProjectDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public ActionResult<AdminProjectDto> UpdateProjectStatus(
        int id,
        [FromBody] UpdateProjectStatusRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Status) || !MockAdminData.ValidStatuses.Contains(request.Status))
        {
            return BadRequest(new ApiErrorResponse(
                "Dữ liệu không hợp lệ",
                new Dictionary<string, string[]>
                {
                    ["status"] = new[] { "Chỉ chấp nhận: Active, Hidden" }
                }));
        }

        var project = MockAdminData.Projects.FirstOrDefault(p => p.Id == id);
        if (project is null)
            return NotFound(new ApiErrorResponse("Không tìm thấy dự án"));

        var updated = project with { Status = request.Status };
        MockAdminData.ReplaceProject(updated);
        return Ok(updated);
    }

    // ── 3. GET /api/admin/users ─────────────────────────────────────────────

    /// <summary>Danh sách tất cả người dùng, có phân trang.</summary>
    [HttpGet("users")]
    [ProducesResponseType(typeof(PagedResult<AdminUserDto>), StatusCodes.Status200OK)]
    public ActionResult<PagedResult<AdminUserDto>> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var all = MockAdminData.Users
            .OrderBy(u => u.CreatedAt)
            .ToList();

        var items = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Ok(new PagedResult<AdminUserDto>(items, page, pageSize, all.Count));
    }

    // ── 4. PUT /api/admin/users/{id}/lock ──────────────────────────────────

    /// <summary>Khóa hoặc mở khóa tài khoản người dùng.</summary>
    [HttpPut("users/{id}/lock")]
    [ProducesResponseType(typeof(AdminUserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public ActionResult<AdminUserDto> LockUser(
        string id,
        [FromBody] LockUserRequest request)
    {
        var callerId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        var callerEmail = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

        // Khóa chính mình: 400
        if ((!string.IsNullOrEmpty(callerId) && string.Equals(id, callerId, StringComparison.OrdinalIgnoreCase)) ||
            (!string.IsNullOrEmpty(callerEmail) && string.Equals(id, callerEmail, StringComparison.OrdinalIgnoreCase)))
        {
            return BadRequest(new ApiErrorResponse(
                "Không thể khóa chính tài khoản của mình",
                new Dictionary<string, string[]>
                {
                    ["id"] = new[] { "Không thể khóa chính tài khoản của mình" }
                }));
        }

        var target = MockAdminData.Users.FirstOrDefault(u => u.Id == id);
        if (target is null)
            return NotFound(new ApiErrorResponse("Không tìm thấy người dùng"));

        if (!string.IsNullOrEmpty(callerEmail) && string.Equals(target.Email, callerEmail, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new ApiErrorResponse(
                "Không thể khóa chính tài khoản của mình",
                new Dictionary<string, string[]>
                {
                    ["id"] = new[] { "Không thể khóa chính tài khoản của mình" }
                }));
        }

        // Khóa Admin khác: 400
        if (string.Equals(target.Role, "Admin", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new ApiErrorResponse(
                "Không thể khóa tài khoản Admin khác",
                new Dictionary<string, string[]>
                {
                    ["id"] = new[] { "Không thể khóa tài khoản Admin khác" }
                }));
        }

        var updated = target with { IsLocked = request.IsLocked!.Value };
        MockAdminData.ReplaceUser(updated);
        return Ok(updated);
    }
}
