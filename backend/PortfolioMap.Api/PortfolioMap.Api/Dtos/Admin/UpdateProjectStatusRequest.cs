using System.ComponentModel.DataAnnotations;

namespace PortfolioMap.Api.Dtos.Admin;

/// <summary>Body cho PUT /api/admin/projects/{id}/status.</summary>
public record UpdateProjectStatusRequest(
    [Required(ErrorMessage = "Trạng thái là bắt buộc")]
    string? Status);
