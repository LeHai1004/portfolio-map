using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.Extensions.Logging;
using NetTopologySuite.Geometries;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Models;
using DtoProjectType = PortfolioMap.Api.Dtos.Projects.ProjectType;

namespace PortfolioMap.Api.Services;

/// <summary>
/// CRUD dự án, ảnh, tag, trường lưu vào DB. Giữ nguyên hợp đồng của S1-02.
/// Lưu ý cho người đọc: code dùng _db.Set&lt;T&gt;() và khóa ngoại thay vì navigation property,
/// và đặt Type/Status qua SetNamed, để không phụ thuộc cách Models/Project.cs khai báo chúng.
/// </summary>
public class ProjectsService : IProjectsService
{
    private const long MaxImageBytes = 5 * 1024 * 1024;
    private static readonly string[] AllowedContentTypes = { "image/jpeg", "image/png", "image/webp" };

    private readonly AppDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly ILogger<ProjectsService> _logger;

    public ProjectsService(AppDbContext db, IWebHostEnvironment env, ILogger<ProjectsService> logger)
    {
        _db = db;
        _env = env;
        _logger = logger;
    }

    // ---------- Tạo ----------

    public async Task<ProjectResult<ProjectDetailDto>> CreateAsync(string userId, ProjectUpsertRequest r, CancellationToken ct = default)
    {
        var invalid = await ValidateAsync(r, ct);
        if (invalid is not null) return ProjectResult<ProjectDetailDto>.Invalid(invalid);

        var project = new Project
        {
            OwnerId = userId,
            Title = r.Title.Trim(),
            Description = r.Description,
            Latitude = r.Latitude!.Value,
            Longitude = r.Longitude!.Value,
            // Kinh độ (X) trước, vĩ độ (Y) sau.
            Location = new Point(r.Longitude.Value, r.Latitude.Value) { SRID = 4326 },
            AddressText = r.AddressText,
            UniversityId = r.UniversityId,
            GithubUrl = r.GithubUrl,
            DemoUrl = r.DemoUrl,
            ViewCount = 0,
            CreatedAt = DateTime.UtcNow
        };

        var entry = _db.Add(project);
        SetNamed(entry, "Type", r.Type!.Value.ToString());
        SetNamed(entry, "Status", "Active");

        await using var tx = await _db.Database.BeginTransactionAsync(ct);
        await _db.SaveChangesAsync(ct);   // lấy Id của dự án

        foreach (var tagId in DistinctTagIds(r))
            _db.Add(new ProjectTag { ProjectId = project.Id, TagId = tagId });
        await _db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        var dto = await BuildDetailAsync(project.Id, ct);
        return ProjectResult<ProjectDetailDto>.Ok(dto!);
    }

    // ---------- Xem chi tiết ----------

    public async Task<ProjectResult<ProjectDetailDto>> GetAsync(int id, string? userId, bool isAdmin, CancellationToken ct = default)
    {
        var project = await _db.Set<Project>().FirstOrDefaultAsync(p => p.Id == id, ct);
        if (project is null) return ProjectResult<ProjectDetailDto>.NotFound("Không tìm thấy dự án");

        var status = _db.Entry(project).Property("Status").CurrentValue?.ToString();
        if (string.Equals(status, "Hidden", StringComparison.OrdinalIgnoreCase)
            && !isAdmin && project.OwnerId != userId)
        {
            return ProjectResult<ProjectDetailDto>.NotFound("Không tìm thấy dự án");
        }

        // Tăng lượt xem bằng một lệnh UPDATE nguyên tử, tránh mất lượt khi nhiều người xem cùng lúc.
        var touched = await _db.Set<Project>()
            .Where(p => p.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.ViewCount, p => p.ViewCount + 1), ct);
        if (touched == 0) return ProjectResult<ProjectDetailDto>.NotFound("Không tìm thấy dự án");

        var dto = await BuildDetailAsync(id, ct);
        return dto is null
            ? ProjectResult<ProjectDetailDto>.NotFound("Không tìm thấy dự án")
            : ProjectResult<ProjectDetailDto>.Ok(dto);
    }

    // ---------- Sửa ----------

    public async Task<ProjectResult<ProjectDetailDto>> UpdateAsync(int id, string userId, ProjectUpsertRequest r, CancellationToken ct = default)
    {
        var project = await _db.Set<Project>().FirstOrDefaultAsync(p => p.Id == id, ct);
        if (project is null) return ProjectResult<ProjectDetailDto>.NotFound("Không tìm thấy dự án");
        if (project.OwnerId != userId)
            return ProjectResult<ProjectDetailDto>.Forbidden("Bạn không có quyền thao tác dự án này");

        var invalid = await ValidateAsync(r, ct);
        if (invalid is not null) return ProjectResult<ProjectDetailDto>.Invalid(invalid);

        project.Title = r.Title.Trim();
        project.Description = r.Description;
        project.Latitude = r.Latitude!.Value;
        project.Longitude = r.Longitude!.Value;
        project.Location = new Point(r.Longitude.Value, r.Latitude.Value) { SRID = 4326 };
        project.AddressText = r.AddressText;
        project.UniversityId = r.UniversityId;
        project.GithubUrl = r.GithubUrl;
        project.DemoUrl = r.DemoUrl;
        project.UpdatedAt = DateTime.UtcNow;
        SetNamed(_db.Entry(project), "Type", r.Type!.Value.ToString());

        // Chỉ thêm tag mới và bỏ tag không còn. Không xóa rồi thêm lại cùng khóa trong một lần lưu.
        var existing = await _db.Set<ProjectTag>().Where(t => t.ProjectId == id).ToListAsync(ct);
        var wanted = DistinctTagIds(r).ToHashSet();
        _db.RemoveRange(existing.Where(t => !wanted.Contains(t.TagId)));
        var existingIds = existing.Select(t => t.TagId).ToHashSet();
        foreach (var tagId in wanted.Where(t => !existingIds.Contains(t)))
            _db.Add(new ProjectTag { ProjectId = id, TagId = tagId });

        await _db.SaveChangesAsync(ct);

        var dto = await BuildDetailAsync(id, ct);
        return ProjectResult<ProjectDetailDto>.Ok(dto!);
    }

    // ---------- Xóa ----------

    public async Task<ProjectResult<bool>> DeleteAsync(int id, string userId, bool isAdmin, CancellationToken ct = default)
    {
        var owner = await _db.Set<Project>()
            .Where(p => p.Id == id)
            .Select(p => new { p.OwnerId })
            .FirstOrDefaultAsync(ct);
        if (owner is null) return ProjectResult<bool>.NotFound("Không tìm thấy dự án");
        if (!isAdmin && owner.OwnerId != userId)
            return ProjectResult<bool>.Forbidden("Bạn không có quyền thao tác dự án này");

        // Ảnh và tag xóa theo nhờ khóa ngoại CASCADE trong DB.
        await _db.Set<Project>().Where(p => p.Id == id).ExecuteDeleteAsync(ct);
        DeleteProjectFolder(id);
        return ProjectResult<bool>.Ok(true);
    }

    // ---------- Dự án của tôi ----------

    public async Task<PagedResult<ProjectSummaryDto>> GetMineAsync(string userId, int page, int pageSize, CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Set<Project>().AsNoTracking().Where(p => p.OwnerId == userId);
        var total = await query.CountAsync(ct);

        var rows = await query
            .OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new { p.Id, p.Title, p.Type, p.Latitude, p.Longitude, p.CreatedAt })
            .ToListAsync(ct);

        var ids = rows.Select(x => x.Id).ToList();
        var images = await _db.Set<ProjectImage>().AsNoTracking()
            .Where(i => ids.Contains(i.ProjectId))
            .OrderBy(i => i.SortOrder).ThenBy(i => i.Id)
            .Select(i => new { i.ProjectId, i.ImageUrl })
            .ToListAsync(ct);
        var thumbs = images.GroupBy(i => i.ProjectId).ToDictionary(g => g.Key, g => g.First().ImageUrl);

        var items = rows.Select(x => new ProjectSummaryDto(
            x.Id, x.Title, ParseType(x.Type),
            thumbs.TryGetValue(x.Id, out var url) ? url : null,
            x.Latitude, x.Longitude, x.CreatedAt)).ToList();

        return new PagedResult<ProjectSummaryDto>(items, page, pageSize, total);
    }

    // ---------- Ảnh ----------

    public async Task<ProjectResult<ProjectImageDto>> AddImageAsync(int projectId, string userId, IFormFile file, CancellationToken ct = default)
    {
        var project = await _db.Set<Project>().FirstOrDefaultAsync(p => p.Id == projectId, ct);
        if (project is null) return ProjectResult<ProjectImageDto>.NotFound("Không tìm thấy dự án");
        if (project.OwnerId != userId)
            return ProjectResult<ProjectImageDto>.Forbidden("Bạn không có quyền thao tác dự án này");

        if (file is null || file.Length == 0)
            return Bad("Chưa chọn file ảnh", "File là bắt buộc");
        if (file.Length > MaxImageBytes)
            return Bad("Ảnh quá lớn", "Ảnh tối đa 5 MB");
        if (!AllowedContentTypes.Contains(file.ContentType, StringComparer.OrdinalIgnoreCase))
            return Bad("Định dạng ảnh không hỗ trợ", "Chỉ nhận JPEG, PNG, WebP");

        // Không tin tên file hay Content-Type do client gửi: đọc vài byte đầu để biết định dạng thật.
        var header = new byte[12];
        int read;
        await using (var s = file.OpenReadStream())
            read = await s.ReadAtLeastAsync(header, header.Length, throwOnEndOfStream: false, ct);
        var ext = DetectExtension(header, read);
        if (ext is null)
            return Bad("Nội dung file không phải ảnh hợp lệ", "Chỉ nhận JPEG, PNG, WebP");

        var dir = ProjectDir(projectId);
        Directory.CreateDirectory(dir);
        var fileName = $"{Guid.NewGuid():N}{ext}";   // tên do server sinh, không dùng tên của người dùng
        var path = Path.Combine(dir, fileName);
        await using (var fs = new FileStream(path, FileMode.CreateNew))
            await file.CopyToAsync(fs, ct);

        try
        {
            var maxOrder = await _db.Set<ProjectImage>()
                .Where(i => i.ProjectId == projectId)
                .MaxAsync(i => (int?)i.SortOrder, ct);

            var image = new ProjectImage
            {
                ProjectId = projectId,
                ImageUrl = $"/uploads/projects/{projectId}/{fileName}",
                SortOrder = (maxOrder ?? -1) + 1
            };
            _db.Add(image);
            project.ThumbnailUrl ??= image.ImageUrl;   // ảnh đầu tiên làm ảnh đại diện
            await _db.SaveChangesAsync(ct);

            return ProjectResult<ProjectImageDto>.Ok(new ProjectImageDto(image.Id, image.ImageUrl));
        }
        catch
        {
            if (File.Exists(path)) File.Delete(path);   // lưu DB lỗi thì không để file mồ côi
            throw;
        }
    }

    public async Task<ProjectResult<bool>> DeleteImageAsync(int projectId, int imageId, string userId, CancellationToken ct = default)
    {
        var project = await _db.Set<Project>().FirstOrDefaultAsync(p => p.Id == projectId, ct);
        if (project is null) return ProjectResult<bool>.NotFound("Không tìm thấy dự án");
        if (project.OwnerId != userId)
            return ProjectResult<bool>.Forbidden("Bạn không có quyền thao tác dự án này");

        var image = await _db.Set<ProjectImage>()
            .FirstOrDefaultAsync(i => i.Id == imageId && i.ProjectId == projectId, ct);
        if (image is null) return ProjectResult<bool>.NotFound("Không tìm thấy ảnh");

        var next = await _db.Set<ProjectImage>()
            .Where(i => i.ProjectId == projectId && i.Id != imageId)
            .OrderBy(i => i.SortOrder).ThenBy(i => i.Id)
            .Select(i => i.ImageUrl)
            .FirstOrDefaultAsync(ct);

        _db.Remove(image);
        project.ThumbnailUrl = next;   // null nếu hết ảnh
        await _db.SaveChangesAsync(ct);

        // GetFileName chặn đường dẫn lạ như ../ trong ImageUrl.
        var file = Path.Combine(ProjectDir(projectId), Path.GetFileName(image.ImageUrl));
        try
        {
            if (File.Exists(file)) File.Delete(file);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete project image file {FilePath}", file);
        }

        return ProjectResult<bool>.Ok(true);
    }

    // ---------- Tag, trường ----------

    public async Task<IReadOnlyList<TagDto>> GetTagsAsync(CancellationToken ct = default) =>
        await _db.Set<Tag>().AsNoTracking()
            .OrderBy(t => t.Name)
            .Select(t => new TagDto(t.Id, t.Name))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<UniversityDto>> GetUniversitiesAsync(CancellationToken ct = default) =>
        await _db.Set<University>().AsNoTracking()
            .OrderBy(u => u.Name)
            .Select(u => new UniversityDto(u.Id, u.Name, u.Address, u.Latitude, u.Longitude))
            .ToListAsync(ct);

    // ---------- Hỗ trợ ----------

    private async Task<ProjectDetailDto?> BuildDetailAsync(int id, CancellationToken ct)
    {
        var p = await _db.Set<Project>().AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return null;

        var images = await _db.Set<ProjectImage>().AsNoTracking()
            .Where(i => i.ProjectId == id)
            .OrderBy(i => i.SortOrder).ThenBy(i => i.Id)
            .Select(i => new ProjectImageDto(i.Id, i.ImageUrl))
            .ToListAsync(ct);

        var tags = await (from pt in _db.Set<ProjectTag>().AsNoTracking()
                          join t in _db.Set<Tag>().AsNoTracking() on pt.TagId equals t.Id
                          where pt.ProjectId == id
                          orderby t.Name
                          select new TagDto(t.Id, t.Name)).ToListAsync(ct);

        var owner = await _db.Set<AppUser>().AsNoTracking()
            .Where(u => u.Id == p.OwnerId)
            .Select(u => new OwnerDto(u.Id, u.FullName, u.AvatarUrl))
            .FirstOrDefaultAsync(ct)
            ?? new OwnerDto(p.OwnerId, "(không rõ)", null);

        string? universityName = null;
        if (p.UniversityId is { } uid)
            universityName = await _db.Set<University>().AsNoTracking()
                .Where(u => u.Id == uid).Select(u => u.Name).FirstOrDefaultAsync(ct);

        return new ProjectDetailDto(
            p.Id, p.Title, p.Description, ParseType(p.Type), p.Latitude, p.Longitude, p.AddressText,
            p.UniversityId, universityName, p.GithubUrl, p.DemoUrl,
            images.FirstOrDefault()?.ImageUrl,   // thumbnail = ảnh đầu tiên
            images, tags, owner, p.ViewCount, p.CreatedAt);
    }

    private async Task<ApiErrorResponse?> ValidateAsync(ProjectUpsertRequest r, CancellationToken ct)
    {
        var errors = new Dictionary<string, string[]>();

        if (r.Type is { } type && !Enum.IsDefined(type))
            errors["type"] = new[] { "Loại dự án không hợp lệ. Chỉ nhận: Web, Mobile, Game, AI, Other" };

        if (r.UniversityId is { } uid && !await _db.Set<University>().AnyAsync(u => u.Id == uid, ct))
            errors["universityId"] = new[] { "Trường không tồn tại" };

        var tagIds = DistinctTagIds(r);
        if (tagIds.Count > 0)
        {
            var found = await _db.Set<Tag>().Where(t => tagIds.Contains(t.Id)).Select(t => t.Id).ToListAsync(ct);
            var missing = tagIds.Except(found).ToList();
            if (missing.Count > 0)
                errors["tagIds"] = new[] { $"Tag không tồn tại: {string.Join(", ", missing)}" };
        }

        return errors.Count == 0 ? null : new ApiErrorResponse("Dữ liệu gửi lên không hợp lệ", errors);
    }

    private static List<int> DistinctTagIds(ProjectUpsertRequest r) => r.TagIds.Distinct().ToList();

    /// <summary>Đặt Type/Status dù entity khai báo là enum hay string.</summary>
    private static void SetNamed(EntityEntry entry, string propertyName, string value)
    {
        var prop = entry.Property(propertyName);
        var clr = Nullable.GetUnderlyingType(prop.Metadata.ClrType) ?? prop.Metadata.ClrType;
        prop.CurrentValue = clr.IsEnum ? Enum.Parse(clr, value, ignoreCase: true) : value;
    }

    /// <summary>Đọc Type từ entity (enum hay string đều ra tên) rồi đổi sang enum của DTO.</summary>
    private static DtoProjectType ParseType(object? raw) =>
        Enum.TryParse<DtoProjectType>(raw?.ToString(), ignoreCase: true, out var t) ? t : DtoProjectType.Other;

    private static string? DetectExtension(byte[] b, int n)
    {
        if (n >= 3 && b[0] == 0xFF && b[1] == 0xD8 && b[2] == 0xFF) return ".jpg";
        if (n >= 8 && b[0] == 0x89 && b[1] == 0x50 && b[2] == 0x4E && b[3] == 0x47
                   && b[4] == 0x0D && b[5] == 0x0A && b[6] == 0x1A && b[7] == 0x0A) return ".png";
        if (n >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                    && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return ".webp";
        return null;
    }

    private string ProjectDir(int projectId)
    {
        var root = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        return Path.Combine(root, "uploads", "projects", projectId.ToString());
    }

    private void DeleteProjectFolder(int projectId)
    {
        var dir = ProjectDir(projectId);
        try
        {
            if (Directory.Exists(dir)) Directory.Delete(dir, recursive: true);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete project image directory {DirectoryPath}", dir);
        }
    }

    private static ProjectResult<ProjectImageDto> Bad(string message, string fileError) =>
        ProjectResult<ProjectImageDto>.Invalid(
            new ApiErrorResponse(message, new Dictionary<string, string[]> { ["file"] = new[] { fileError } }));
}