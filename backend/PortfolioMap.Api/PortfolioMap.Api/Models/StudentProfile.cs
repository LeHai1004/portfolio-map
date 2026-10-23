namespace PortfolioMap.Api.Models;

public class StudentProfile
{
    public string UserId { get; set; } = string.Empty;
    public AppUser? User { get; set; }

    public int? UniversityId { get; set; }
    public University? University { get; set; }

    public string? Major { get; set; }
    public string? GithubUrl { get; set; }
    public string? LinkedInUrl { get; set; }
}