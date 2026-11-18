using System.ComponentModel.DataAnnotations;

namespace PortfolioMap.Api.Dtos.Admin;

/// <summary>Body cho PUT /api/admin/users/{id}/lock.</summary>
public record LockUserRequest(
    [Required(ErrorMessage = "isLocked là bắt buộc")]
    bool? IsLocked);
