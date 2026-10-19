namespace PortfolioMap.Api.Models;

public class StudentProfile
{
    public int UserId { get; set; }
    public AppUser? User { get; set; } = null!;

    public int? UniversityId { get; set; }
    public University? University { get; set; }

    public string? Major { get; set; }
    public string? GithubUrl { get; set; }
    public string? LinkedInUrl { get; set; }
}