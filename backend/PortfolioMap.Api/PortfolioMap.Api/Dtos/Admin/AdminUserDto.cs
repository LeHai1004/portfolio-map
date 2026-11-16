namespace PortfolioMap.Api.Dtos.Admin;

/// <summary>Thông tin user cho màn hình Admin.</summary>
public record AdminUserDto(
    string Id,
    string Email,
    string FullName,
    string Role,
    bool IsLocked,
    DateTime CreatedAt);
