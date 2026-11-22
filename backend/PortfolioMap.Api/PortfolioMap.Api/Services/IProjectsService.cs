using Microsoft.AspNetCore.Http;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Services;

public interface IProjectsService
{
    Task<ProjectResult<ProjectDetailDto>> CreateAsync(string userId, ProjectUpsertRequest request, CancellationToken ct = default);

    /// <summary>Xem chi tiết và tăng ViewCount.</summary>
    Task<ProjectResult<ProjectDetailDto>> GetAsync(int id, CancellationToken ct = default);

    Task<ProjectResult<ProjectDetailDto>> UpdateAsync(int id, string userId, ProjectUpsertRequest request, CancellationToken ct = default);

    /// <summary>Chỉ chủ dự án hoặc Admin được xóa.</summary>
    Task<ProjectResult<bool>> DeleteAsync(int id, string userId, bool isAdmin, CancellationToken ct = default);

    Task<PagedResult<ProjectSummaryDto>> GetMineAsync(string userId, int page, int pageSize, CancellationToken ct = default);

    Task<ProjectResult<ProjectImageDto>> AddImageAsync(int projectId, string userId, IFormFile file, CancellationToken ct = default);

    Task<ProjectResult<bool>> DeleteImageAsync(int projectId, int imageId, string userId, CancellationToken ct = default);

    Task<IReadOnlyList<TagDto>> GetTagsAsync(CancellationToken ct = default);

    Task<IReadOnlyList<UniversityDto>> GetUniversitiesAsync(CancellationToken ct = default);
}