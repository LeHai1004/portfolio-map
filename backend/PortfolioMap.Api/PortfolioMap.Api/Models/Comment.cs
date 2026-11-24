namespace PortfolioMap.Api.Models;

public class Comment
{
    public int Id { get; set; }

    public int ProjectId { get; set; }
    public Project? Project { get; set; }

    public string UserId { get; set; } = string.Empty;
    public AppUser? User { get; set; }

    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
