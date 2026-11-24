using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Company;

namespace PortfolioMap.Api.Services;

public enum SavedProjectResultStatus
{
    Ok,
    NotFound,
    Conflict
}

public record SavedProjectResult(
    SavedProjectResultStatus Status,
    Dtos.Common.ApiErrorResponse? Error,
    DateTime? SavedAt = null)
{
    public bool IsOk => Status == SavedProjectResultStatus.Ok;

    public static SavedProjectResult Ok(DateTime? savedAt = null) =>
        new(SavedProjectResultStatus.Ok, null, savedAt);

    public static SavedProjectResult NotFound(string message) =>
        new(SavedProjectResultStatus.NotFound, new ApiErrorResponse(message));

    public static SavedProjectResult Conflict(string message) =>
        new(SavedProjectResultStatus.Conflict, new ApiErrorResponse(message));
}

public interface ISavedProjectsService
{
    Task<SavedProjectResult> SaveAsync(
        string userId,
        int projectId,
        CancellationToken ct = default);

    Task<SavedProjectResult> UnsaveAsync(
        string userId,
        int projectId,
        CancellationToken ct = default);

    Task<PagedResult<SavedProjectDto>> GetAsync(
        string userId,
        int page,
        int pageSize,
        CancellationToken ct = default);
}
