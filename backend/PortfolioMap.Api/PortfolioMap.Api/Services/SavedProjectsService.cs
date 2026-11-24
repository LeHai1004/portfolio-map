using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Company;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Models;
using DtoProjectType = PortfolioMap.Api.Dtos.Projects.ProjectType;

namespace PortfolioMap.Api.Services;

public sealed class SavedProjectsService : ISavedProjectsService
{
    private readonly AppDbContext _db;

    public SavedProjectsService(AppDbContext db) => _db = db;

    public async Task<SavedProjectResult> SaveAsync(
        string userId,
        int projectId,
        CancellationToken ct = default)
    {
        var exists = await _db.Projects
            .AsNoTracking()
            .AnyAsync(project => project.Id == projectId, ct);
        if (!exists)
        {
            return SavedProjectResult.NotFound(
                "Không tìm thấy dự án");
        }

        var alreadySaved = await _db.SavedProjects
            .AsNoTracking()
            .AnyAsync(saved => saved.UserId == userId && saved.ProjectId == projectId, ct);
        if (alreadySaved)
        {
            return SavedProjectResult.Conflict(
                "Dự án này đã được lưu từ trước.");
        }

        var savedAt = DateTime.UtcNow;
        _db.SavedProjects.Add(new SavedProject
        {
            UserId = userId,
            ProjectId = projectId,
            SavedAt = savedAt
        });
        await _db.SaveChangesAsync(ct);
        return SavedProjectResult.Ok(savedAt);
    }

    public async Task<SavedProjectResult> UnsaveAsync(
        string userId,
        int projectId,
        CancellationToken ct = default)
    {
        var saved = await _db.SavedProjects
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.ProjectId == projectId,
                ct);
        if (saved is null)
        {
            return SavedProjectResult.NotFound(
                "Dự án chưa được lưu");
        }

        _db.SavedProjects.Remove(saved);
        await _db.SaveChangesAsync(ct);
        return SavedProjectResult.Ok();
    }

    public async Task<PagedResult<SavedProjectDto>> GetAsync(
        string userId,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query =
            from saved in _db.SavedProjects.AsNoTracking()
            join project in _db.Projects.AsNoTracking()
                on saved.ProjectId equals project.Id
            where saved.UserId == userId
            select new { saved.SavedAt, Project = project };

        var totalItems = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(row => row.SavedAt)
            .ThenByDescending(row => row.Project.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = rows.Select(row =>
        {
            var project = row.Project;
            var summary = new ProjectSummaryDto(
                project.Id,
                project.Title,
                ParseType(project.Type),
                project.ThumbnailUrl,
                project.Latitude,
                project.Longitude,
                project.CreatedAt);
            return new SavedProjectDto(summary, row.SavedAt);
        }).ToList();

        return new PagedResult<SavedProjectDto>(
            items,
            page,
            pageSize,
            totalItems);
    }

    private static DtoProjectType ParseType(object? raw) =>
        Enum.TryParse<DtoProjectType>(raw?.ToString(), ignoreCase: true, out var type)
            ? type
            : DtoProjectType.Other;
}
