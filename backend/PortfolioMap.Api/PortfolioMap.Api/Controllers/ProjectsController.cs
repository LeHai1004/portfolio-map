using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Services;

namespace PortfolioMap.Api.Controllers;

/// <summary>
/// API dự án lưu DB. Hợp đồng (đường dẫn, mã trạng thái, DTO) giữ nguyên như S1-02.
/// Ràng buộc {id:int} giúp "mine" và "nearby" không bị nhầm thành id.
/// </summary>
[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectsService _projects;

    public ProjectsController(IProjectsService projects) => _projects = projects;

    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    private static ApiErrorResponse NoUser() => new("Chưa đăng nhập hoặc token sai");

    /// <summary>Thả ghim dự án mới. Quyền: Student.</summary>
    [HttpPost]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProjectDetailDto>> Create([FromBody] ProjectUpsertRequest request, CancellationToken ct)
    {
        if (CurrentUserId is not { } userId) return Unauthorized(NoUser());

        var result = await _projects.CreateAsync(userId, request, ct);
        if (!result.IsOk) return Fail(result);
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    /// <summary>Xem chi tiết dự án, tăng lượt xem. Quyền: Public.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectDetailDto>> GetById(int id, CancellationToken ct)
    {
        var result = await _projects.GetAsync(id, ct);
        return result.IsOk ? Ok(result.Value) : Fail(result);
    }

    /// <summary>Sửa dự án, body giống POST. Quyền: chủ dự án.</summary>
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectDetailDto>> Update(int id, [FromBody] ProjectUpsertRequest request, CancellationToken ct)
    {
        if (CurrentUserId is not { } userId) return Unauthorized(NoUser());

        var result = await _projects.UpdateAsync(id, userId, request, ct);
        return result.IsOk ? Ok(result.Value) : Fail(result);
    }

    /// <summary>Xóa dự án. Quyền: chủ dự án hoặc Admin.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Student,Admin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        if (CurrentUserId is not { } userId) return Unauthorized(NoUser());

        var result = await _projects.DeleteAsync(id, userId, User.IsInRole("Admin"), ct);
        return result.IsOk ? NoContent() : Fail(result);
    }

    /// <summary>Danh sách dự án của tôi, có phân trang (page, pageSize). Quyền: Student.</summary>
    [HttpGet("mine")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(PagedResult<ProjectSummaryDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ProjectSummaryDto>>> Mine(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 10, CancellationToken ct = default)
    {
        if (CurrentUserId is not { } userId) return Unauthorized(NoUser());
        return Ok(await _projects.GetMineAsync(userId, page, pageSize, ct));
    }

    /// <summary>Tải thêm ảnh (multipart/form-data, trường "file"). Quyền: Student, chủ dự án.</summary>
    [HttpPost("{id:int}/images")]
    [Authorize(Roles = "Student")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ProjectImageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProjectImageDto>> UploadImage(int id, IFormFile file, CancellationToken ct)
    {
        if (CurrentUserId is not { } userId) return Unauthorized(NoUser());

        var result = await _projects.AddImageAsync(id, userId, file, ct);
        return result.IsOk ? StatusCode(StatusCodes.Status201Created, result.Value) : Fail(result);
    }

    /// <summary>Xóa một ảnh của dự án. Quyền: Student, chủ dự án.</summary>
    [HttpDelete("{id:int}/images/{imageId:int}")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteImage(int id, int imageId, CancellationToken ct)
    {
        if (CurrentUserId is not { } userId) return Unauthorized(NoUser());

        var result = await _projects.DeleteImageAsync(id, imageId, userId, ct);
        return result.IsOk ? NoContent() : Fail(result);
    }

    private ActionResult Fail<T>(ProjectResult<T> result) => result.Status switch
    {
        ProjectResultStatus.NotFound => NotFound(result.Error),
        ProjectResultStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, result.Error),
        ProjectResultStatus.Invalid => BadRequest(result.Error),
        _ => StatusCode(StatusCodes.Status500InternalServerError, result.Error)
    };
}