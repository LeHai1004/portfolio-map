namespace PortfolioMap.Api.Models;

public class ContactMessage
{
    public int Id { get; set; }

    public string FromUserId { get; set; } = string.Empty;
    public AppUser? FromUser { get; set; }

    public string ToUserId { get; set; } = string.Empty;
    public AppUser? ToUser { get; set; }

    public int? ProjectId { get; set; }
    public Project? Project { get; set; }

    public string Subject { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}