using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using Scalar.AspNetCore;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// 1. Kết nối SQL Server (có hỗ trợ kiểu tọa độ geography)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Chưa cấu hình ConnectionStrings:DefaultConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sql => sql.UseNetTopologySuite()));

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
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();   // trang xem và thử API: /scalar/v1
}

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);           // phải đặt trước UseAuthorization
app.UseAuthorization();
app.MapControllers();

app.Run();