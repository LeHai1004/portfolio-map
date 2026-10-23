namespace PortfolioMap.Api.Models;

public class CompanyProfile
{
    public string UserId { get; set; } = string.Empty;
    public AppUser? User { get; set; }

    public string CompanyName { get; set; } = string.Empty;
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? Description { get; set; }
    public string? LogoUrl { get; set; }
}