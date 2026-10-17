using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Auth;
using System;
using PortfolioMap.Api.Dtos.Auth;

namespace PortfolioMap.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        // 1. POST /api/auth/register
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            // Giả lập 409: Tài khoản đã tồn tại
            if (request.Email == "exist@example.com")
            {
                return Conflict(new { message = "Email đã tồn tại" });
            }

            // Trả về 201: Đăng ký thành công
            var response = new RegisterResponse
            {
                Id = 1,
                Email = request.Email,
                FullName = request.FullName,
                Role = request.Role
            };

            return Created("", response);
        }

        // 2. POST /api/auth/login
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Giả lập 403: Tài khoản bị khóa
            if (request.Email == "locked@example.com")
            {
                return StatusCode(403, new { message = "Tài khoản bị khóa" });
            }

            // Giả lập 401: Sai email hoặc mật khẩu
            if (request.Email == "wrong@example.com" || request.Password == "wrongpassword")
            {
                return Unauthorized(new { message = "Sai email hoặc mật khẩu" });
            }

            // Trả về 200: Đăng nhập thành công với token ảo
            var response = new LoginResponse
            {
                AccessToken = "eyJhbGciOiJIUzI1NiIsInR5c...fakeToken",
                ExpiresAt = DateTime.UtcNow.AddDays(7),
                User = new UserDto
                {
                    Id = 1,
                    Email = request.Email,
                    FullName = "Nguyễn Văn A",
                    Role = "Student",
                    AvatarUrl = "https://example.com/avatar.jpg"
                }
            };

            return Ok(response);
        }

        // 3. GET /api/auth/me
        [HttpGet("me")]
        // [Authorize] // CHƯA GẮN: Thẻ hiện thực sẽ mở comment dòng này
        public IActionResult GetMe()
        {
            // Tạm thời trả về 200 mặc định vì chưa có JWT để kiểm tra 401
            var user = new UserDto
            {
                Id = 1,
                Email = "a@example.com",
                FullName = "Nguyễn Văn A",
                Role = "Student",
                AvatarUrl = "https://example.com/avatar.jpg"
            };

            return Ok(user);
        }
    }
}