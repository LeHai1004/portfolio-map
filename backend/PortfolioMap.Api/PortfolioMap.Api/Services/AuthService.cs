using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
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
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;

        public AuthService(
            UserManager<AppUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
        }

        public async Task<ServiceResult<RegisterResponse>> RegisterAsync(RegisterRequest request)
        {
            // 1. Kiểm tra role hợp lệ
            if (request.Role != "Student" && request.Role != "Company")
            {
                return new ServiceResult<RegisterResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Role chỉ được phép là 'Student' hoặc 'Company'",
                    Errors = new { role = new[] { "Role chỉ được phép là 'Student' hoặc 'Company'" } }
                };
            }

            // 2. Kiểm tra trùng email -> 409
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return new ServiceResult<RegisterResponse>
                {
                    Success = false,
                    StatusCode = 409,
                    Message = "Email đã tồn tại",
                    Errors = new { email = new[] { "Email đã tồn tại" } }
                };
            }

            if (!await _roleManager.RoleExistsAsync(request.Role))
            {
                return new ServiceResult<RegisterResponse>
                {
                    Success = false,
                    StatusCode = 409,
                    Message = "Vai trò chưa được khởi tạo",
                    Errors = new { role = new[] { "Vai trò chưa được khởi tạo" } }
                };
            }

            // 3. Tạo tài khoản mới trong Database
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
                return new ServiceResult<RegisterResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Đăng ký thất bại",
                    Errors = MapIdentityErrors(result.Errors, "email")
                };
            }

            // 4. Gán role đã được khởi tạo khi ứng dụng khởi động
            var addToRoleResult = await _userManager.AddToRoleAsync(user, request.Role);
            if (!addToRoleResult.Succeeded)
            {
                var errors = addToRoleResult.Errors
                    .Select(error => error.Description)
                    .ToList();
                var cleanupResult = await _userManager.DeleteAsync(user);
                if (!cleanupResult.Succeeded)
                {
                    errors.AddRange(cleanupResult.Errors.Select(error => error.Description));
                }

                return new ServiceResult<RegisterResponse>
                {
                    Success = false,
                    StatusCode = 409,
                    Message = "Không thể gán role cho tài khoản",
                    Errors = new Dictionary<string, string[]> { ["role"] = errors.ToArray() }
                };
            }

            var response = new RegisterResponse
            {
                Id = user.Id.ToString(),
                Email = user.Email!,
                FullName = user.FullName,
                Role = request.Role
            };

            return new ServiceResult<RegisterResponse>
            {
                Success = true,
                StatusCode = 201,
                Data = response
            };
        }

        public async Task<ServiceResult<LoginResponse>> LoginAsync(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, request.Password))
            {
                return new ServiceResult<LoginResponse>
                {
                    Success = false,
                    StatusCode = 401,
                    Message = "Sai email hoặc mật khẩu",
                    Errors = new { }
                };
            }

            // Kiểm tra tài khoản bị khóa -> 403
            if (user.IsLocked)
            {
                return new ServiceResult<LoginResponse>
                {
                    Success = false,
                    StatusCode = 403,
                    Message = "Tài khoản bị khóa",
                    Errors = new { }
                };
            }

            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count != 1 || !IsSupportedRole(roles[0]))
            {
                return new ServiceResult<LoginResponse>
                {
                    Success = false,
                    StatusCode = 403,
                    Message = "Tài khoản chưa được gán vai trò",
                    Errors = new { }
                };
            }

            string userRole = roles[0];

            // Sinh Token JWT thật sống 120 phút
            var expiresAt = DateTime.UtcNow.AddMinutes(120);
            var token = GenerateJwtToken(user, userRole, expiresAt);

            var response = new LoginResponse
            {
                AccessToken = token,
                ExpiresAt = expiresAt,
                User = new UserDto
                {
                    Id = user.Id.ToString(),
                    Email = user.Email!,
                    FullName = user.FullName,
                    Role = userRole,
                    AvatarUrl = user.AvatarUrl
                }
            };

            return new ServiceResult<LoginResponse>
            {
                Success = true,
                StatusCode = 200,
                Data = response
            };
        }

        public async Task<ServiceResult<UserDto>> GetMeAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new ServiceResult<UserDto>
                {
                    Success = false,
                    StatusCode = 401,
                    Message = "Không tìm thấy thông tin người dùng",
                    Errors = new { }
                };
            }

            var roles = await _userManager.GetRolesAsync(user);
            if (roles.Count != 1 || !IsSupportedRole(roles[0]))
            {
                return new ServiceResult<UserDto>
                {
                    Success = false,
                    StatusCode = 403,
                    Message = "Tài khoản chưa được gán vai trò",
                    Errors = new { }
                };
            }

            string userRole = roles[0];

            var userDto = new UserDto
            {
                Id = user.Id.ToString(),
                Email = user.Email!,
                FullName = user.FullName,
                Role = userRole,
                AvatarUrl = user.AvatarUrl
            };

            return new ServiceResult<UserDto>
            {
                Success = true,
                StatusCode = 200,
                Data = userDto
            };
        }

        private static Dictionary<string, string[]> MapIdentityErrors(IEnumerable<IdentityError> errors, string defaultField)
        {
            return errors
                .GroupBy(error => error.Code.StartsWith("Password", StringComparison.Ordinal) ? "password" : defaultField)
                .ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray());
        }

        private static bool IsSupportedRole(string role)
        {
            return role is "Student" or "Company" or "Admin";
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