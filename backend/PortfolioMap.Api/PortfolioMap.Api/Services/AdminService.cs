using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Dtos.Admin;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Services;

public class AdminService : IAdminService
{
    private readonly AppDbContext _db;

    public AdminService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<AdminProjectDto>> GetProjectsAsync(
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Projects
            .AsNoTracking()
            .Join(
                _db.Users,
                project => project.OwnerId,
                owner => owner.Id,
                (project, owner) => new AdminProjectDto(
                    project.Id,
                    project.Title,
                    project.Type == "Web"
                        ? ProjectType.Web
                        : project.Type == "Mobile"
                            ? ProjectType.Mobile
                            : project.Type == "Game"
                                ? ProjectType.Game
                                : project.Type == "AI"
                                    ? ProjectType.AI
                                    : ProjectType.Other,
                    project.Status,
                    project.OwnerId,
                    owner.FullName,
                    project.CreatedAt));

        var totalItems = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(project => project.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<AdminProjectDto>(items, page, pageSize, totalItems);
    }

    public async Task<ProjectResult<AdminProjectDto>> UpdateProjectStatusAsync(
        int id,
        string? status,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(status) ||
            status is not ("Active" or "Hidden"))
        {
            return ProjectResult<AdminProjectDto>.Invalid(new ApiErrorResponse(
                "Dữ liệu không hợp lệ",
                new Dictionary<string, string[]>
                {
                    ["status"] = ["Chỉ chấp nhận: Active, Hidden"]
                }));
        }

        var project = await _db.Projects.FirstOrDefaultAsync(
            item => item.Id == id,
            ct);
        if (project is null)
        {
            return ProjectResult<AdminProjectDto>.NotFound("Không tìm thấy dự án");
        }

        project.Status = status;
        project.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        var ownerName = await _db.Users
            .AsNoTracking()
            .Where(user => user.Id == project.OwnerId)
            .Select(user => user.FullName)
            .FirstOrDefaultAsync(ct) ?? string.Empty;

        var dto = new AdminProjectDto(
            project.Id,
            project.Title,
            project.Type == "Web"
                ? ProjectType.Web
                : project.Type == "Mobile"
                    ? ProjectType.Mobile
                    : project.Type == "Game"
                        ? ProjectType.Game
                        : project.Type == "AI"
                            ? ProjectType.AI
                            : ProjectType.Other,
            project.Status,
            project.OwnerId,
            ownerName,
            project.CreatedAt);

        return ProjectResult<AdminProjectDto>.Ok(dto);
    }

    public async Task<PagedResult<AdminUserDto>> GetUsersAsync(
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query =
            from user in _db.Users.AsNoTracking()
            join userRole in _db.UserRoles.AsNoTracking()
                on user.Id equals userRole.UserId
            join role in _db.Roles.AsNoTracking()
                on userRole.RoleId equals role.Id
            select new AdminUserDto(
                user.Id,
                user.Email ?? string.Empty,
                user.FullName,
                role.Name ?? string.Empty,
                user.IsLocked,
                user.CreatedAt);

        var totalItems = await query.CountAsync(ct);
        var items = await query
            .OrderBy(user => user.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<AdminUserDto>(items, page, pageSize, totalItems);
    }

    public async Task<ProjectResult<AdminUserDto>> LockUserAsync(
        string id,
        bool? isLocked,
        string callerId,
        string callerEmail,
        CancellationToken ct = default)
    {
        if (isLocked is null)
        {
            return ProjectResult<AdminUserDto>.Invalid(new ApiErrorResponse(
                "Dữ liệu không hợp lệ",
                new Dictionary<string, string[]>
                {
                    ["isLocked"] = ["isLocked là bắt buộc"]
                }));
        }

        var user = await _db.Users.FirstOrDefaultAsync(
            item => item.Id == id,
            ct);
        if (user is null)
        {
            return ProjectResult<AdminUserDto>.NotFound("Không tìm thấy người dùng");
        }

        if (isLocked.Value)
        {
            if ((!string.IsNullOrEmpty(callerId) &&
                 string.Equals(user.Id, callerId, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrEmpty(callerEmail) &&
                 string.Equals(user.Email, callerEmail, StringComparison.OrdinalIgnoreCase)))
            {
                return ProjectResult<AdminUserDto>.Invalid(new ApiErrorResponse(
                    "Không thể khóa chính tài khoản của mình",
                    new Dictionary<string, string[]>
                    {
                        ["id"] = ["Không thể khóa chính tài khoản của mình"]
                    }));
            }

            var roleName = await (
                from userRole in _db.UserRoles.AsNoTracking()
                join roleEntity in _db.Roles.AsNoTracking()
                    on userRole.RoleId equals roleEntity.Id
                where userRole.UserId == user.Id
                select roleEntity.Name
            ).FirstOrDefaultAsync(ct);

            if (string.Equals(roleName, "Admin", StringComparison.OrdinalIgnoreCase))
            {
                return ProjectResult<AdminUserDto>.Invalid(new ApiErrorResponse(
                    "Không thể khóa tài khoản Admin khác",
                    new Dictionary<string, string[]>
                    {
                        ["id"] = ["Không thể khóa tài khoản Admin khác"]
                    }));
            }
        }

        user.IsLocked = isLocked.Value;
        await _db.SaveChangesAsync(ct);

        var assignedRoleName = await (
            from userRole in _db.UserRoles.AsNoTracking()
            join roleEntity in _db.Roles.AsNoTracking()
                on userRole.RoleId equals roleEntity.Id
            where userRole.UserId == user.Id
            select roleEntity.Name
        ).FirstOrDefaultAsync(ct) ?? string.Empty;

        return ProjectResult<AdminUserDto>.Ok(new AdminUserDto(
            user.Id,
            user.Email ?? string.Empty,
            user.FullName,
            assignedRoleName,
            user.IsLocked,
            user.CreatedAt));
    }
}
