using System.ComponentModel.DataAnnotations;

namespace PortfolioMap.Api.Dtos.Auth
{
    public class RegisterRequest
    {
        [Required(ErrorMessage = "Email là bắt buộc.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
        [MinLength(8, ErrorMessage = "Mật khẩu phải có ít nhất 8 ký tự.")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Họ tên là bắt buộc.")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Role là bắt buộc.")]
        [RegularExpression("^(Student|Company)$", ErrorMessage = "Role chỉ được phép là 'Student' hoặc 'Company'.")]
        public string Role { get; set; }
    }
}