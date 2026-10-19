using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PortfolioMap.Api.Dtos.Auth;
using PortfolioMap.Api.Models;

namespace PortfolioMap.Api.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly RoleManager<IdentityRole<int>> _roleManager;
        private readonly IConfiguration _configuration;

        public AuthService(
            UserManager<AppUser> userManager,
            RoleManager<IdentityRole<int>> roleManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
        }

        public async Task<(bool Success, string ErrorMessage, int StatusCode, RegisterResponse Data)> RegisterAsync(RegisterRequest request)
        {
            // 1. Chặn đăng ký Role ngoài Student hoặc Company
            if (request.Role != "Student" && request.Role != "Company")
            {
                return (false, "Role chỉ được phép là Student hoặc Company", 400, null);
            }

            // 2. Kiểm tra email tồn tại -> 409
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return (false, "Email đã tồn tại", 409, null);
            }

            // 3. Tạo tài khoản mới
            var user = new AppUser
            {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return (false, "Không thể tạo tài khoản", 400, null);
            }

            // 4. Gán Role
            await _userManager.AddToRoleAsync(user, request.Role);

            var response = new RegisterResponse
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = request.Role
            };

            return (true, null, 201, response);
        }

        public async Task<(bool Success, string ErrorMessage, int StatusCode, LoginResponse Data)> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                // Sai email hoặc mật khẩu -> 401
                return (false, "Sai email hoặc mật khẩu", 401, null);
            }

            // Kiểm tra tài khoản bị khóa -> 403
            if (user.IsLocked)
            {
                return (false, "Tài khoản bị khóa", 403, null);
            }

            // Lấy roles của user
            var roles = await _userManager.GetRolesAsync(user);
            string userRole = roles.Count > 0 ? roles[0] : "Student";

            // Sinh JWT Token sống 120 phút
            var expiresAt = DateTime.UtcNow.AddMinutes(120);
            var token = GenerateJwtToken(user, userRole, expiresAt);

            var response = new LoginResponse
            {
                AccessToken = token,
                ExpiresAt = expiresAt,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Role = userRole,
                    AvatarUrl = user.AvatarUrl
                }
            };

            return (true, null, 200, response);
        }

        public async Task<UserDto> GetMeAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);
            string userRole = roles.Count > 0 ? roles[0] : "Student";

            return new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = userRole,
                AvatarUrl = user.AvatarUrl
            };
        }

        private string GenerateJwtToken(AppUser user, string role, DateTime expiresAt)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email!),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: expiresAt,
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}