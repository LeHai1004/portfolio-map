using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Dtos.Search;

namespace PortfolioMap.Api.Services;

public interface IProjectSearchService
{
    Task<PagedResult<ProjectSummaryDto>> SearchAsync(
        ProjectSearchQuery query,
        ProjectType? type,
        bool sortByViews,
        CancellationToken ct = default);
}
