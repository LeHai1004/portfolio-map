using System.ComponentModel.DataAnnotations;

namespace PortfolioMap.Api.Dtos.Users;

/// <summary>Dữ liệu dùng để đổi mật khẩu tài khoản.</summary>
public sealed record ChangePasswordRequest
{
    [Required(ErrorMessage = "Mật khẩu hiện tại là bắt buộc.")]
    public required string CurrentPassword { get; init; }

    [Required(ErrorMessage = "Mật khẩu mới là bắt buộc.")]
    [MinLength(8, ErrorMessage = "Mật khẩu mới phải có ít nhất 8 ký tự.")]
    public required string NewPassword { get; init; }

    [Required(ErrorMessage = "Vui lòng xác nhận mật khẩu mới.")]
    [Compare(nameof(NewPassword), ErrorMessage = "Mật khẩu xác nhận không khớp.")]
    public required string ConfirmNewPassword { get; init; }
}
