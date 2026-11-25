using PortfolioMap.Api.Dtos.Search;

namespace PortfolioMap.Api.Mock;

/// <summary>Dữ liệu gần nhất mẫu cho GET /api/projects/nearby.</summary>
public static class MockNearbyData
{
    private const double EarthRadiusKm = 6371.0088;

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