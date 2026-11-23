using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Dtos.Search;

/// <summary>ProjectSummaryDto kèm khoảng cách (km). Các trường đầu giữ y nguyên ProjectSummaryDto.</summary>
public record NearbyProjectDto(
    int Id,
    string Title,
    ProjectType Type,
    string? ThumbnailUrl,   // KIỂM TRA: kiểu phải giống ProjectSummaryDto
    double Latitude,
    double Longitude,
    DateTime CreatedAt,
    double DistanceKm);