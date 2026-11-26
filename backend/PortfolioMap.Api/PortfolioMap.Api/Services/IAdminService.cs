using PortfolioMap.Api.Dtos.Admin;
using PortfolioMap.Api.Dtos.Common;

namespace PortfolioMap.Api.Services;

public interface IAdminService
{
    Task<PagedResult<AdminProjectDto>> GetProjectsAsync(
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<ProjectResult<AdminProjectDto>> UpdateProjectStatusAsync(
        int id,
        string? status,
        CancellationToken ct = default);

    Task<PagedResult<AdminUserDto>> GetUsersAsync(
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<ProjectResult<AdminUserDto>> LockUserAsync(
        string id,
        bool? isLocked,
        string callerId,
        string callerEmail,
        CancellationToken ct = default);
}
