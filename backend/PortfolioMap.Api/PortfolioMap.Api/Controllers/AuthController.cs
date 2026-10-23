using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Auth;
using PortfolioMap.Api.Services;

namespace PortfolioMap.Api.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        // Tiêm IAuthService vào Controller
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // 1. POST /api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { message = result.ErrorMessage, errors = result.Errors });
            }

            return StatusCode(201, result.Data);
        }

        // 2. POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { message = result.ErrorMessage, errors = result.Errors });
            }

            return Ok(result.Data);
        }

        // 3. GET /api/auth/me
        [HttpGet("me")]
        [Authorize] // Đã gắn Authorize để bắt buộc gửi kèm JWT Token
        public async Task<IActionResult> GetMe()
        {
            // Lấy UserId từ Claims trong Token JWT sau khi đã giải mã thành công
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(new
                {
                    message = "Chưa đăng nhập hoặc token sai",
                    errors = new { }
                });
            }

            var result = await _authService.GetMeAsync(userIdClaim);
            if (!result.Success)
            {
                return StatusCode(result.StatusCode, new { message = result.ErrorMessage, errors = result.Errors });
            }

            return Ok(result.Data);
        }
    }
}