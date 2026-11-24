using PortfolioMap.Api.Dtos.Map;
using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Services;

public interface IMapService
{
    Task<IReadOnlyList<PinDto>> GetPinsAsync(
        double minLat,
        double maxLat,
        double minLng,
        double maxLng,
        ProjectType? type,
        int? tag,
        CancellationToken cancellationToken = default);
}
