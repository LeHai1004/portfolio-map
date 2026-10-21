using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Mock;

namespace PortfolioMap.Api.Controllers;

/// <summary>
/// HỢP ĐỒNG API dự án (trả dữ liệu mẫu, chưa truy cập DB, chưa upload thật).
/// TODO khi S1-03 xong: thêm [Authorize(Roles = "Student")] cho POST/PUT/mine/images,
/// [Authorize(Roles = "Student,Admin")] cho DELETE, và lấy userId từ token thay cho CurrentUserId.
/// Ràng buộc {id:int} giúp "mine" và "nearby" không bị nhầm thành id.
/// </summary>
[ApiController]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private const long MaxImageBytes = 5 * 1024 * 1024;
    private static readonly string[] AllowedImageTypes = { "image/jpeg", "image/png", "image/webp" };

    /// <summary>Thả ghim dự án mới. Quyền: Student.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public ActionResult<ProjectDetailDto> Create([FromBody] ProjectUpsertRequest request)
    {
        if (ValidateReferences(request) is { } error) return BadRequest(error);

        var dto = MockProjectData.FromRequest(MockProjectData.NewProjectId, request, MockProjectData.OwnerA, null);
        return CreatedAtAction(nameof(GetById), new { id = dto.Id }, dto);
    }

    /// <summary>Xem chi tiết dự án (thật sẽ tăng lượt xem). Quyền: Public.</summary>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public ActionResult<ProjectDetailDto> GetById(int id)
    {
        var project = Find(id);
        return project is null ? NotFound(NotFoundError()) : Ok(project);
    }

    /// <summary>Sửa dự án, body giống POST. Quyền: chủ dự án.</summary>
    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ProjectDetailDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public ActionResult<ProjectDetailDto> Update(int id, [FromBody] ProjectUpsertRequest request)
    {
        var project = Find(id);
        if (project is null) return NotFound(NotFoundError());
        if (project.Owner.Id != MockProjectData.CurrentUserId) return StatusCode(403, ForbiddenError());
        if (ValidateReferences(request) is { } error) return BadRequest(error);

        return Ok(MockProjectData.FromRequest(id, request, project.Owner, project));
    }

    /// <summary>Xóa dự án. Quyền: chủ dự án hoặc Admin.</summary>
    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult Delete(int id)
    {
        var project = Find(id);
        if (project is null) return NotFound(NotFoundError());
        if (project.Owner.Id != MockProjectData.CurrentUserId) return StatusCode(403, ForbiddenError());
        return NoContent();
    }

    /// <summary>Danh sách dự án của tôi, có phân trang (page, pageSize). Quyền: Student.</summary>
    [HttpGet("mine")]
    [ProducesResponseType(typeof(PagedResult<ProjectSummaryDto>), StatusCodes.Status200OK)]
    public ActionResult<PagedResult<ProjectSummaryDto>> Mine([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var all = MockProjectData.Projects
            .Where(p => p.Owner.Id == MockProjectData.CurrentUserId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(MockProjectData.ToSummary)
            .ToList();

        var items = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Ok(new PagedResult<ProjectSummaryDto>(items, page, pageSize, all.Count));
    }

    /// <summary>Tải thêm ảnh (multipart/form-data, trường "file"). Quyền: Student, chủ dự án. Chưa lưu file thật.</summary>
    [HttpPost("{id:int}/images")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(ProjectImageDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public ActionResult<ProjectImageDto> UploadImage(int id, IFormFile file)
    {
        var project = Find(id);
        if (project is null) return NotFound(NotFoundError());
        if (project.Owner.Id != MockProjectData.CurrentUserId) return StatusCode(403, ForbiddenError());

        if (file is null || file.Length == 0)
            return BadRequest(new ApiErrorResponse("Chưa chọn file ảnh", new() { ["file"] = new[] { "File là bắt buộc" } }));
        if (file.Length > MaxImageBytes)
            return BadRequest(new ApiErrorResponse("Ảnh quá lớn", new() { ["file"] = new[] { "Ảnh tối đa 5 MB" } }));
        if (!AllowedImageTypes.Contains(file.ContentType))
            return BadRequest(new ApiErrorResponse("Định dạng ảnh không hỗ trợ", new() { ["file"] = new[] { "Chỉ nhận JPEG, PNG, WebP" } }));

        var dto = new ProjectImageDto(MockProjectData.NewImageId, $"/uploads/mock/{id}-new.jpg");
        return StatusCode(StatusCodes.Status201Created, dto);
    }

    /// <summary>Xóa một ảnh của dự án. Quyền: Student, chủ dự án.</summary>
    [HttpDelete("{id:int}/images/{imageId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult DeleteImage(int id, int imageId)
    {
        var project = Find(id);
        if (project is null) return NotFound(NotFoundError());
        if (project.Owner.Id != MockProjectData.CurrentUserId) return StatusCode(403, ForbiddenError());
        if (project.Images.All(i => i.Id != imageId))
            return NotFound(new ApiErrorResponse("Không tìm thấy ảnh"));
        return NoContent();
    }

    // ---- helpers ----

    private static ProjectDetailDto? Find(int id) => MockProjectData.Projects.FirstOrDefault(p => p.Id == id);

    private static ApiErrorResponse NotFoundError() => new("Không tìm thấy dự án");

    private static ApiErrorResponse ForbiddenError() => new("Bạn không có quyền thao tác dự án này");

    /// <summary>Kiểm tra universityId và tagIds có tồn tại (bản thật sẽ hỏi DB).</summary>
    private static ApiErrorResponse? ValidateReferences(ProjectUpsertRequest r)
    {
        var errors = new Dictionary<string, string[]>();

        if (r.UniversityId is { } uid && MockProjectData.Universities.All(u => u.Id != uid))
            errors["universityId"] = new[] { "Trường không tồn tại" };

        var badTags = r.TagIds.Where(t => MockProjectData.Tags.All(x => x.Id != t)).Distinct().ToList();
        if (badTags.Count > 0)
            errors["tagIds"] = new[] { $"Tag không tồn tại: {string.Join(", ", badTags)}" };

        return errors.Count == 0 ? null : new ApiErrorResponse("Dữ liệu gửi lên không hợp lệ", errors);
    }
}