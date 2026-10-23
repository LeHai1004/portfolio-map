using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Models;
using PortfolioMap.Api.Services;
using Scalar.AspNetCore;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// 1. Kết nối SQL Server (có hỗ trợ kiểu tọa độ geography)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Chưa cấu hình ConnectionStrings:DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sql => sql.UseNetTopologySuite()));

// 2. Cấu hình Identity Core
builder.Services.AddIdentityCore<AppUser>(options =>
{
    // Quy tắc mật khẩu theo yêu cầu đề bài
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;       // Tắt bắt buộc chữ hoa
    options.Password.RequireNonAlphanumeric = false; // Tắt bắt buộc ký tự đặc biệt
})
.AddRoles<IdentityRole<int>>()
.AddEntityFrameworkStores<AppDbContext>();

// 3. Cấu hình JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"] ?? throw new InvalidOperationException("Chưa cấu hình JwtSettings:Key"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// 4. Đăng ký Dependency Injection cho AuthService
builder.Services.AddScoped<IAuthService, AuthService>();

// 5. CORS: cho phép giao diện React (cổng 5173) gọi API
const string CorsPolicy = "FrontendDev";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy =>
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

<<<<<<< HEAD
// 6. Controllers & Cấu hình phản hồi lỗi Validation theo quy chuẩn { message, errors }
builder.Services.AddControllers()
.ConfigureApiBehaviorOptions(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        // Lấy danh sách lỗi từ ModelState và ép key về camelCase (vd: 'Email' -> 'email')
        var errors = context.ModelState
            .Where(e => e.Value.Errors.Count > 0)
            .ToDictionary(
                kvp => char.ToLower(kvp.Key[0]) + kvp.Key.Substring(1),
                kvp => kvp.Value.Errors.Select(e => e.ErrorMessage).ToArray()
            );

        return new BadRequestObjectResult(new
        {
            message = "Dữ liệu sai",
            errors = errors
        });
    };
});

=======
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Mọi lỗi 400 do kiểm tra dữ liệu đều trả đúng dạng của nhóm: message + errors
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
>>>>>>> ae80242a83fa65681849eecbf8379e8cf209bc82
builder.Services.AddOpenApi();

var app = builder.Build();

// 7. Tự động tạo 3 Role (Student, Company, Admin) khi khởi động nếu chưa có trong DB
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<int>>>();
    string[] roles = ["Student", "Company", "Admin"];
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole<int>(role));
        }
    }
}

// 8. Pipeline Middleware
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();   // Trang xem và thử API: /scalar/v1
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);           // Phải đặt trước Authentication & Authorization

app.UseAuthentication();          // BẮT BUỘC: Đặt ngay trước UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();