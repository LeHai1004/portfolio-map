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
                var errorsDict = new Dictionary<string, string[]>();
                foreach (var err in result.Errors)
                {
                    errorsDict[err.Code] = new[] { err.Description };
                }

                return new ServiceResult<RegisterResponse>
                {
                    Success = false,
                    StatusCode = 400,
                    Message = "Đăng ký thất bại",
                    Errors = errorsDict
                };
            }

            // 4. Đảm bảo role tồn tại trước khi gán
            if (!await _roleManager.RoleExistsAsync(request.Role))
            {
                var createRoleResult = await _roleManager.CreateAsync(new IdentityRole(request.Role));
                if (!createRoleResult.Succeeded)
                {
                    await _userManager.DeleteAsync(user);
                    return new ServiceResult<RegisterResponse>
                    {
                        Success = false,
                        StatusCode = 500,
                        Message = "Không thể tạo role cho tài khoản",
                        Errors = createRoleResult.Errors
                            .GroupBy(error => error.Code)
                            .ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray())
                    };
                }
            }

            var addToRoleResult = await _userManager.AddToRoleAsync(user, request.Role);
            if (!addToRoleResult.Succeeded)
            {
                await _userManager.DeleteAsync(user);
                return new ServiceResult<RegisterResponse>
                {
                    Success = false,
                    StatusCode = 500,
                    Message = "Không thể gán role cho tài khoản",
                    Errors = addToRoleResult.Errors
                        .GroupBy(error => error.Code)
                        .ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray())
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
            string userRole = roles.Count > 0 ? roles[0] : "Student";

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
            string userRole = roles.Count > 0 ? roles[0] : "Student";

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