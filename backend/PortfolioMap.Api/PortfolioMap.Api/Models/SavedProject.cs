namespace PortfolioMap.Api.Models;

public class SavedProject
{
    public int UserId { get; set; }
    public AppUser? User { get; set; } = null!;

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public DateTime SavedAt { get; set; } = DateTime.UtcNow;
}