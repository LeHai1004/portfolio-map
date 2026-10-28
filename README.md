# Portfolio Map

Mạng xã hội bản đồ portfolio cho sinh viên: sinh viên thả ghim dự án trên bản đồ, công ty công nghệ xem và liên hệ.

## Công nghệ

- Backend: ASP.NET Core Web API (.NET 10), Entity Framework Core, SQL Server
- Frontend: React, Vite, TypeScript, Leaflet
- Node.js: bản LTS (chạy `node -v` trên máy bạn rồi ghi số phiên bản vào đây)

## Cấu trúc thư mục

- `backend/PortfolioMap.Api/`: solution và project API (mở file solution bằng Visual Studio)
- `frontend/`: giao diện React (mở bằng VS Code)
- `docs/`: tài liệu, quy ước, bộ Postman

## Cách chạy

### Backend

1. Cài .NET SDK, Visual Studio, SQL Server Express và SSMS.
2. Vào thư mục `backend/PortfolioMap.Api/PortfolioMap.Api/`, copy `appsettings.example.json` thành `appsettings.Development.json`, rồi sửa `Server=` thành tên SQL Server trên máy bạn (xem trong cửa sổ Connect của SSMS). Thay `JwtSettings:Key` bằng khóa ngẫu nhiên ít nhất 32 byte; không commit file `appsettings.Development.json` Điền thêm JwtSettings:Key (chuỗi riêng từ 32 ký tự). Nếu gặp lỗi ‘certificate chain not trusted’ thì giữ TrustServerCertificate=True trong chuỗi kết nối..
3. Mở solution bằng Visual Studio, vào Tools, NuGet Package Manager, Package Manager Console, chạy `Update-Database`.
4. Bấm chạy (profile https). Mở `https://localhost:<cổng>/scalar/v1` để xem và thử API. Số cổng xem trong `Properties/launchSettings.json`.

### Frontend

1. Mở terminal trong thư mục `frontend`.
2. Chạy `npm install`.
3. Chạy `copy .env.example .env`, rồi sửa `VITE_API_URL` thành địa chỉ backend ở bước trên.
4. Chạy `npm run dev`, mở `http://localhost:5173`.

## Quy ước làm việc

Đọc `docs/QUY-UOC.md` trước khi bắt đầu:

- Không push thẳng `main` và `develop`, luôn làm qua Pull Request.
- Tên nhánh lấy y nguyên từ thẻ Trello, ví dụ `feature/auth-register-contract`.
- Commit theo dạng `loại(chức-năng): mô tả`, ví dụ `feat(auth): thêm API đăng ký`.
- Mỗi người có SQL Server riêng, cấu trúc bảng đi qua thư mục `Migrations`.
