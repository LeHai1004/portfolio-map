using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Models;
using PortfolioMap.Api.Services;
using Scalar.AspNetCore;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// 1. Kết nối SQL Server (có hỗ trợ kiểu tọa độ geography)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Chưa cấu hình ConnectionStrings:DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sql => sql.UseNetTopologySuite()));

var jwtIssuer = builder.Configuration["JwtSettings:Issuer"]
    ?? throw new InvalidOperationException("Chưa cấu hình JwtSettings:Issuer");
var jwtAudience = builder.Configuration["JwtSettings:Audience"]
    ?? throw new InvalidOperationException("Chưa cấu hình JwtSettings:Audience");
var jwtKey = builder.Configuration["JwtSettings:Key"]
    ?? throw new InvalidOperationException("Chưa cấu hình JwtSettings:Key. Hãy đặt biến môi trường JwtSettings__Key.");
if (string.IsNullOrWhiteSpace(jwtKey) ||
    string.Equals(jwtKey.Trim(), "SET_JWT_SECRET", StringComparison.OrdinalIgnoreCase))
{
    throw new InvalidOperationException("JwtSettings:Key vẫn là giá trị mẫu. Hãy cấu hình secret riêng bằng User Secrets hoặc biến môi trường JwtSettings__Key.");
}

var jwtKeyBytes = Encoding.UTF8.GetBytes(jwtKey);
if (jwtKeyBytes.Length < 32)
{
    throw new InvalidOperationException("JwtSettings:Key phải là secret riêng có ít nhất 32 byte.");
}

builder.Services
    .AddIdentityCore<AppUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireUppercase = false;
        options.Password.RequireNonAlphanumeric = false;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultForbidScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(jwtKeyBytes),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
        options.Events = new JwtBearerEvents
        {
            OnChallenge = async context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Chưa đăng nhập hoặc token không hợp lệ",
                    errors = new { }
                });
            },
            OnForbidden = async context =>
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Bạn không có quyền truy cập",
                    errors = new { }
                });
            }
        };
    });

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddAuthorization();

// 2. CORS: cho phép giao diện React (cổng 5173) gọi API
const string CorsPolicy = "FrontendDev";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value is { Errors.Count: > 0 })
                .ToDictionary(
                    e => JsonNamingPolicy.CamelCase.ConvertName(e.Key),
                    e => e.Value!.Errors
                        .Select(x => string.IsNullOrEmpty(x.ErrorMessage) ? "Giá trị không hợp lệ" : x.ErrorMessage)
                        .ToArray());

            return new BadRequestObjectResult(new { message = "Dữ liệu không hợp lệ", errors });
        };
    });
builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    foreach (var role in new[] { "Student", "Company", "Admin" })
    {
        if (await roleManager.RoleExistsAsync(role))
        {
            continue;
        }

        var result = await roleManager.CreateAsync(new IdentityRole(role));
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(error => error.Description));
            throw new InvalidOperationException($"Không thể tạo role '{role}': {errors}");
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();   // trang xem và thử API: /scalar/v1
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();