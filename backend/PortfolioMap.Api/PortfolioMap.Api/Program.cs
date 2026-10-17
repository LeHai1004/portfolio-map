using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using Scalar.AspNetCore;
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