namespace PortfolioMap.Api.Dtos.Projects;

public record ProjectSummaryDto(
    int Id,
    string Title,
    ProjectType Type,
    string? ThumbnailUrl,
    double Latitude,
    double Longitude,
    DateTime CreatedAt);