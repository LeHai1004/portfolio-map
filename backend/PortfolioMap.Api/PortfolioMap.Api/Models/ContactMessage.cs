namespace PortfolioMap.Api.Models;

public class ContactMessage
{
    public int Id { get; set; }

    public int FromUserId { get; set; }
    public AppUser? FromUser { get; set; } = null!;

    public int ToUserId { get; set; }
    public AppUser? ToUser { get; set; } = null!;

    public int? ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}