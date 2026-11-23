using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Dtos.Search;

namespace PortfolioMap.Api.Mock;

/// <summary>DỮ LIỆU MẪU cho tìm kiếm. XÓA file này khi nối DB thật.</summary>
public static class MockSearchData
{
    private const double EarthRadiusKm = 6371.0088;

    public static (List<ProjectSummaryDto> Items, int Total) Search(
        string? keyword, int? tag, ProjectType? type, int? universityId,
        bool sortByViews, int page, int pageSize)
    {
        // Bỏ dự án Hidden
        var query = MockProjectData.Projects.Where(p => !MockProjectData.IsHidden(p.Id));

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var k = keyword.Trim();
            query = query.Where(p =>
                p.Title.Contains(k, StringComparison.OrdinalIgnoreCase) ||
                (p.Description?.Contains(k, StringComparison.OrdinalIgnoreCase) ?? false));
        }
        if (tag.HasValue) query = query.Where(p => p.Tags.Any(t => t.Id == tag.Value));
        if (type.HasValue) query = query.Where(p => p.Type == type.Value);
        if (universityId.HasValue) query = query.Where(p => p.UniversityId == universityId.Value);

        query = sortByViews
            ? query.OrderByDescending(p => p.ViewCount).ThenByDescending(p => p.CreatedAt)
            : query.OrderByDescending(p => p.CreatedAt);

        var all = query.ToList();
        var items = all.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(MockProjectData.ToSummary).ToList();
        return (items, all.Count);
    }

    public static List<NearbyProjectDto> Nearby(double lat, double lng, double radiusKm)
    {
        return MockProjectData.Projects
            .Where(p => !MockProjectData.IsHidden(p.Id))
            .Select(p => (Project: p, Km: HaversineKm(lat, lng, p.Latitude, p.Longitude)))
            .Where(x => x.Km <= radiusKm)
            .OrderBy(x => x.Km)
            .Take(100)
            .Select(x => new NearbyProjectDto(
                x.Project.Id, x.Project.Title, x.Project.Type, x.Project.ThumbnailUrl,
                x.Project.Latitude, x.Project.Longitude, x.Project.CreatedAt,
                Math.Round(x.Km, 2)))
            .ToList();
    }

    /// <summary>Khoảng cách đường tròn lớn giữa hai điểm, đơn vị km.</summary>
    public static double HaversineKm(double lat1, double lng1, double lat2, double lng2)
    {
        static double Rad(double deg) => deg * Math.PI / 180.0;
        var dLat = Rad(lat2 - lat1);
        var dLng = Rad(lng2 - lng1);
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(Rad(lat1)) * Math.Cos(Rad(lat2)) * Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        return 2 * EarthRadiusKm * Math.Asin(Math.Min(1, Math.Sqrt(a)));
    }
}