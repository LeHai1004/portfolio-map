namespace PortfolioMap.Api.Models;

public class Like
{
    public string UserId { get; set; } = string.Empty;
    public AppUser? User { get; set; }

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
