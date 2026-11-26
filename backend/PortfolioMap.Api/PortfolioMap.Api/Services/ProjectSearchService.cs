using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Dtos.Search;

namespace PortfolioMap.Api.Services;

public sealed class ProjectSearchService : IProjectSearchService
{
    private readonly AppDbContext _db;

    public ProjectSearchService(AppDbContext db) => _db = db;

    public async Task<PagedResult<ProjectSummaryDto>> SearchAsync(
        ProjectSearchQuery query,
        ProjectType? type,
        bool sortByViews,
        CancellationToken ct = default)
    {
        var projects = _db.Projects
            .AsNoTracking()
            .Where(project => project.Status == "Active");

        if (!string.IsNullOrWhiteSpace(query.Keyword))
        {
            var keyword = query.Keyword.Trim();
            projects = projects.Where(project =>
                project.Title.Contains(keyword) ||
                (project.Description != null &&
                 project.Description.Contains(keyword)));
        }

        if (type.HasValue)
        {
            var typeName = type.Value.ToString();
            projects = projects.Where(project => project.Type == typeName);
        }

        if (query.Tag.HasValue)
        {
            var tagId = query.Tag.Value;
            projects = projects.Where(project =>
                project.ProjectTags.Any(projectTag => projectTag.TagId == tagId));
        }

        if (query.UniversityId.HasValue)
        {
            var universityId = query.UniversityId.Value;
            projects = projects.Where(project =>
                project.UniversityId == universityId);
        }

        var totalItems = await projects.CountAsync(ct);
        var orderedProjects = sortByViews
            ? projects.OrderByDescending(project => project.ViewCount)
                .ThenByDescending(project => project.Id)
            : projects.OrderByDescending(project => project.CreatedAt)
                .ThenByDescending(project => project.Id);

        var rows = await orderedProjects
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(project => new ProjectSummaryDto(
                project.Id,
                project.Title,
                Enum.Parse<ProjectType>(project.Type, ignoreCase: true),
                project.ThumbnailUrl,
                project.Latitude,
                project.Longitude,
                project.CreatedAt))
            .ToListAsync(ct);

        return new PagedResult<ProjectSummaryDto>(
            rows,
            query.Page,
            query.PageSize,
            totalItems);
    }
}
