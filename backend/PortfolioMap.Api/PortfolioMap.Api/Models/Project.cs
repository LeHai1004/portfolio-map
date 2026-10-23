using NetTopologySuite.Geometries;

namespace PortfolioMap.Api.Models;

public class Project
{
    public int Id { get; set; }

    public string OwnerId { get; set; } = string.Empty;
    public AppUser? Owner { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = "Web";       // Web, Mobile, Game, AI, Other

    public Point Location { get; set; } = null!;    // kiểu geography, dùng để tìm theo khoảng cách
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string? AddressText { get; set; }

    public int? UniversityId { get; set; }
    public University? University { get; set; }

    public string? GithubUrl { get; set; }
    public string? DemoUrl { get; set; }
    public string? ThumbnailUrl { get; set; }

    public string Status { get; set; } = "Active";  // Active hoặc Hidden
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public List<ProjectImage> Images { get; set; } = new();
    public List<ProjectTag> ProjectTags { get; set; } = new();
}