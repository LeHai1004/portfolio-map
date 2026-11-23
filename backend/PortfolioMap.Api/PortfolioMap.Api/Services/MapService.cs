using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Dtos.Map;
using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Services;

public class MapService : IMapService
{
    private readonly AppDbContext _db;

    public MapService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<PinDto>> GetPinsAsync(
        double minLat,
        double maxLat,
        double minLng,
        double maxLng,
        ProjectType? type,
        int? tag,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Projects
            .AsNoTracking()
            .Where(p => p.Status == "Active")
            .Where(p => p.Latitude >= minLat && p.Latitude <= maxLat)
            .Where(p => p.Longitude >= minLng && p.Longitude <= maxLng);

        if (type.HasValue)
        {
            var typeName = type.Value.ToString();
            query = query.Where(p => p.Type == typeName);
        }

        if (tag.HasValue)
        {
            query = query.Where(p => p.ProjectTags.Any(pt => pt.TagId == tag.Value));
        }

        return await query
            .OrderBy(p => p.Id)
            .Select(p => new PinDto(
                p.Id,
                p.Title,
                p.Latitude,
                p.Longitude,
                p.Type == "Web"
                    ? ProjectType.Web
                    : p.Type == "Mobile"
                        ? ProjectType.Mobile
                        : p.Type == "Game"
                            ? ProjectType.Game
                            : p.Type == "AI"
                                ? ProjectType.AI
                                : ProjectType.Other,
                p.ThumbnailUrl))
            .Take(500)
            .ToListAsync(cancellationToken);
    }
}
