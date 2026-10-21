namespace PortfolioMap.Api.Dtos.Projects;

public record ProjectDetailDto(
    int Id,
    string Title,
    string? Description,
    ProjectType Type,
    double Latitude,
    double Longitude,
    string? AddressText,
    int? UniversityId,
    string? UniversityName,
    string? GithubUrl,
    string? DemoUrl,
    string? ThumbnailUrl,
    IReadOnlyList<ProjectImageDto> Images,
    IReadOnlyList<TagDto> Tags,
    OwnerDto Owner,
    int ViewCount,
    DateTime CreatedAt);
