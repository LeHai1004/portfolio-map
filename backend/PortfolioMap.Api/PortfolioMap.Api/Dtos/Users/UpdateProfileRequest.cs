using System.ComponentModel.DataAnnotations;

namespace PortfolioMap.Api.Dtos.Users;

/// <summary>Dữ liệu được phép cập nhật trong hồ sơ người dùng.</summary>
public sealed record UpdateProfileRequest
{
    [Required(ErrorMessage = "Họ tên là bắt buộc.")]
    public required string FullName { get; init; }

    [Phone(ErrorMessage = "Số điện thoại không hợp lệ.")]
    public string? PhoneNumber { get; init; }

    public int? UniversityId { get; init; }

    [MaxLength(100, ErrorMessage = "Chuyên ngành không được vượt quá 100 ký tự.")]
    public string? Major { get; init; }

    [MaxLength(300, ErrorMessage = "GitHub URL không được vượt quá 300 ký tự.")]
    public string? GithubUrl { get; init; }

    [MaxLength(300, ErrorMessage = "LinkedIn URL không được vượt quá 300 ký tự.")]
    public string? LinkedInUrl { get; init; }
}
