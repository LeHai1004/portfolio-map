# Portfolio Map (đồ án nhóm 5 người, môn Web nâng cao)

Mạng xã hội bản đồ portfolio: sinh viên thả ghim dự án lên bản đồ, công ty xem, lọc, lưu, nhắn liên hệ.

## Công nghệ

- Backend: ASP.NET Core Web API (.NET 10), EF Core, SQL Server (geography), Identity, JWT (chưa làm), OpenAPI + Scalar (/scalar/v1).
- Frontend: React + Vite + TypeScript, React Router, Axios, TanStack Query, MUI, Leaflet + react-leaflet.

## Cấu trúc

- backend/PortfolioMap.Api/PortfolioMap.Api/: Controllers, Dtos, Models, Services, Data, Migrations, Mock.
- frontend/src/: api, components, features/<chức năng>, pages.

## Cách làm

- API-first, mỗi chức năng 2 PR: (1) Hợp đồng (DTO + controller trả dữ liệu mẫu, thư mục Mock), (2) Hiện thực (DB thật).
- Hợp đồng đã merge thì không đổi tên trường, đường dẫn.
- Id người dùng là string. JSON camelCase. Đường dẫn API số nhiều, viết thường.
- Lỗi luôn dạng { "message": "...", "errors": { "tenTruong": ["..."] } }. Đã cấu hình chung trong Program.cs.
- Mã trạng thái: 200, 201, 400, 401, 403, 404, 409. Danh sách phân trang: page, pageSize, items, totalItems.
- Chỉ Hải tạo migration. Không sửa bảng bằng tay.

## Git

- Không push thẳng main/develop. Nhánh: loại/chức-năng-việc-làm. PR vào develop, dưới 300 dòng.
- Commit: loại(chức-năng): mô tả. Không commit appsettings.Development.json, .env.

## Khi tôi nhờ review code

- Chỉ nhận xét, KHÔNG tự sửa file hay tạo file mới.
- Kiểm tra: đúng hợp đồng và quy ước ở trên, đặt tên file/class, dạng lỗi, kiểu Id, bảo mật (không lộ chuỗi kết nối), phụ thuộc thẻ khác.
- Trả lời tiếng Việt, ngắn gọn, nêu rõ lỗi nào bắt buộc sửa, lỗi nào chỉ là góp ý.
