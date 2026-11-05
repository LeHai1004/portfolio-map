# Portfolio Map: luật cho AI agent

Đồ án nhóm 5 người: bản đồ ghim dự án sinh viên.
Đọc `docs/QUY-UOC.md` trước khi làm bất cứ việc gì.

## Công nghệ

- Backend: ASP.NET Core Web API (.NET 10), EF Core, SQL Server, NetTopologySuite (`backend/PortfolioMap.Api/`)
- Frontend: React 19, Vite, TypeScript, MUI, TanStack Query, Axios, Leaflet (`frontend/`)

## Lệnh chạy

- Backend: chạy profile https trong Visual Studio, xem API ở `/scalar/v1`
- Frontend: `cd frontend`, `npm install`, `npm run dev`
- Kiểm tra: `npm run lint`, `npm run build`

## Luật cứng

- Không làm trên `main` hoặc `develop`. Một thẻ = một nhánh = một PR đích `develop`.
- Không sửa file ngoài danh sách của thẻ. Không đổi tên trường, đường dẫn API đã chốt.
- Không tạo migration (chỉ Hải tạo). Không sửa bảng bằng tay.
- Không commit `.env`, `appsettings.Development.json`, khóa API, `.playwright-mcp/`.
- Lỗi API luôn dạng `{ "message", "errors" }`. JSON camelCase.
- Không tự thêm thư viện hay đổi cấu trúc thư mục khi chưa hỏi.

## Cách làm việc

- Đọc code liên quan trước khi sửa. Sửa nhỏ, giải thích từng file.
- Chưa chắc thì hỏi, không đoán.
