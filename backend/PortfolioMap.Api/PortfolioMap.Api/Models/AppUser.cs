using Microsoft.AspNetCore.Identity;

namespace PortfolioMap.Api.Models;

public class AppUser : IdentityUser<int>
{
    public string FullName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public bool IsLocked { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}