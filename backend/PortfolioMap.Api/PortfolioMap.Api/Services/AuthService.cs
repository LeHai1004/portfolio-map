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

        public async Task<(bool Success, string ErrorMessage, int StatusCode, IReadOnlyDictionary<string, string[]> Errors, RegisterResponse Data)> RegisterAsync(RegisterRequest request)
        {
            // 1. Chặn đăng ký Role ngoài Student hoặc Company
            if (request.Role != "Student" && request.Role != "Company")
            {
                return (false, "Role chỉ được phép là Student hoặc Company", 400,
                    new Dictionary<string, string[]> { ["role"] = new[] { "Role chỉ được phép là Student hoặc Company" } }, null);
            }

            // 2. Kiểm tra email tồn tại -> 409
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return (false, "Email đã tồn tại", 409,
                    new Dictionary<string, string[]> { ["email"] = new[] { "Email đã tồn tại" } }, null);
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
                return (false, "Không thể tạo tài khoản", 400,
                    new Dictionary<string, string[]> { ["account"] = result.Errors.Select(error => error.Description).ToArray() }, null);
            }

            // 4. Gán Role
            var roleResult = await _userManager.AddToRoleAsync(user, request.Role);
            if (!roleResult.Succeeded)
            {
                var cleanupResult = await _userManager.DeleteAsync(user);
                var errors = new Dictionary<string, string[]>
                {
                    ["role"] = roleResult.Errors.Select(error => error.Description).ToArray()
                };
                if (!cleanupResult.Succeeded)
                {
                    errors["account"] = cleanupResult.Errors.Select(error => error.Description).ToArray();
                }

                return (false, "Không thể hoàn tất đăng ký tài khoản", 500, errors, null);
            }

            var response = new RegisterResponse
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = request.Role
            };

            return (true, null, 201, new Dictionary<string, string[]>(), response);
        }

        public async Task<(bool Success, string ErrorMessage, int StatusCode, IReadOnlyDictionary<string, string[]> Errors, LoginResponse Data)> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                // Sai email hoặc mật khẩu -> 401
                return (false, "Sai email hoặc mật khẩu", 401, new Dictionary<string, string[]>(), null);
            }

            // Kiểm tra tài khoản bị khóa -> 403
            if (user.IsLocked)
            {
                return (false, "Tài khoản bị khóa", 403, new Dictionary<string, string[]>(), null);
            }

            // Lấy roles của user
            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count != 1 || (roles[0] != "Student" && roles[0] != "Company" && roles[0] != "Admin"))
            {
                return (false, "Tài khoản chưa được phân quyền hợp lệ", 403,
                    new Dictionary<string, string[]> { ["role"] = new[] { "Tài khoản phải có đúng một role hợp lệ" } }, null);
            }

            string userRole = roles[0];

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

            return (true, null, 200, new Dictionary<string, string[]>(), response);
        }

        public async Task<(bool Success, string ErrorMessage, int StatusCode, IReadOnlyDictionary<string, string[]> Errors, UserDto Data)> GetMeAsync(int userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString());
            if (user == null)
            {
                return (false, "Không tìm thấy người dùng", 404, new Dictionary<string, string[]>(), null);
            }

            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count != 1 || (roles[0] != "Student" && roles[0] != "Company" && roles[0] != "Admin"))
            {
                return (false, "Tài khoản chưa được phân quyền hợp lệ", 403,
                    new Dictionary<string, string[]> { ["role"] = new[] { "Tài khoản phải có đúng một role hợp lệ" } }, null);
            }

            string userRole = roles[0];

            var userDto = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = userRole,
                AvatarUrl = user.AvatarUrl
            };

            return (true, null, 200, new Dictionary<string, string[]>(), userDto);
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