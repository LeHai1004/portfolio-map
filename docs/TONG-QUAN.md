# Portfolio Map: tổng quan dự án (cập nhật 21/10/2026)

Mạng xã hội bản đồ portfolio cho sinh viên Đà Nẵng: sinh viên thả ghim dự án lên bản đồ, công ty xem, lọc, lưu dự án và gửi lời nhắn liên hệ. Đồ án môn Web nâng cao, nhóm 5 người.

## Vai trò người dùng

| Vai trò | Làm được gì |
|---|---|
| Khách | Xem bản đồ và chi tiết dự án |
| Student | Đăng ký, thả/sửa/xóa ghim của mình, xem hộp thư |
| Company | Xem, lọc, lưu dự án, gửi lời nhắn cho sinh viên |
| Admin | Ẩn dự án vi phạm, khóa tài khoản (làm thêm) |

## Chức năng và người phụ trách

| Mã | Chức năng | Người | Ghi chú |
|---|---|---|---|
| F1 | Tài khoản, JWT, phân quyền | Quốc | Bắt buộc |
| F2 | Ghim dự án (API) | Sỹ | Bắt buộc |
| F2 | Form thả ghim (giao diện) | Hải | Đã merge |
| F3 | Bản đồ, gom cụm | Hải | Xong gom cụm, chờ API pins thật |
| F3 | API pins theo khung nhìn | Sỹ | Bắt buộc |
| F4 | Tìm kiếm, lọc, bán kính | Sơn | Bắt buộc |
| F5 | Công ty, lưu dự án, lời nhắn | Quang | Bắt buộc |
| F6 | Thích, bình luận | Sơn | Làm thêm |
| F7 | Trang Admin | Quốc | Làm thêm |

Việc chung: Hải giữ file dùng chung, tạo migration, duyệt và merge PR. Sơn lo seed data, Postman, test case.

## Công nghệ

- Frontend: React, Vite, TypeScript, React Router, Axios, TanStack Query, MUI, Leaflet, react-leaflet, react-leaflet-cluster.
- Backend: ASP.NET Core Web API (.NET 10), EF Core, SQL Server (kiểu geography, NetTopologySuite), Identity, JWT, OpenAPI + Scalar (/scalar/v1).

## Cơ sở dữ liệu (đã có migration)

| Bảng | Cột chính |
|---|---|
| AspNetUsers (AppUser) | Id (string), FullName, AvatarUrl, Bio, IsLocked, CreatedAt |
| Universities | Id, Name, Address, Latitude, Longitude |
| Projects | Id, OwnerId (string), Title, Description, Type, Location (geography), Latitude, Longitude, AddressText, UniversityId (nullable), GithubUrl, DemoUrl, ThumbnailUrl, Status (Active/Hidden), ViewCount, CreatedAt, UpdatedAt |
| ProjectImages | Id, ProjectId, ImageUrl, SortOrder |
| Tags, ProjectTags | Tags: Id, Name. ProjectTags: ProjectId, TagId |
| StudentProfiles | UserId, UniversityId, Major, GithubUrl, LinkedInUrl |
| CompanyProfiles | UserId, CompanyName, Website, Address, Description, LogoUrl |
| SavedProjects | UserId, ProjectId, SavedAt |
| ContactMessages | Id, FromUserId, ToUserId, ProjectId, Subject, Content, IsRead, CreatedAt |

Lưu ý: Point tạo theo thứ tự (longitude, latitude), SRID 4326. Chỉ Hải tạo migration.

## Danh sách API (hợp đồng)

Quyền: Public, Login, hoặc đúng vai trò.

| Method | Đường dẫn | Chức năng | Quyền |
|---|---|---|---|
| POST | /api/auth/register | Đăng ký | Public |
| POST | /api/auth/login | Đăng nhập, trả token | Public |
| GET | /api/auth/me | Người đang đăng nhập | Login |
| PUT | /api/users/me | Sửa hồ sơ | Login |
| PUT | /api/users/me/password | Đổi mật khẩu | Login |
| POST | /api/users/me/avatar | Tải ảnh đại diện | Login |
| GET | /api/users/{id} | Hồ sơ công khai | Public |
| POST | /api/projects | Thả ghim | Student |
| GET | /api/projects/{id} | Chi tiết dự án | Public |
| PUT | /api/projects/{id} | Sửa (chỉ chủ) | Student |
| DELETE | /api/projects/{id} | Xóa (chủ hoặc Admin) | Student, Admin |
| GET | /api/projects/mine | Dự án của tôi | Student |
| POST | /api/projects/{id}/images | Tải thêm ảnh | Student |
| DELETE | /api/projects/{id}/images/{imageId} | Xóa ảnh | Student |
| GET | /api/tags | Danh sách tag | Public |
| GET | /api/universities | Danh sách trường | Public |
| GET | /api/map/pins | Ghim trong khung nhìn (minLat, maxLat, minLng, maxLng, type, tag) | Public |
| GET | /api/projects | Tìm, lọc, phân trang | Public |
| GET | /api/projects/nearby | Tìm theo bán kính (lat, lng, radiusKm) | Public |
| GET | /api/companies/{id} | Hồ sơ công ty | Public |
| PUT | /api/companies/me | Sửa hồ sơ công ty | Company |
| POST | /api/saved-projects/{projectId} | Lưu dự án | Company |
| DELETE | /api/saved-projects/{projectId} | Bỏ lưu | Company |
| GET | /api/saved-projects | Danh sách đã lưu | Company |
| POST | /api/contacts | Gửi lời nhắn | Company |
| GET | /api/contacts/inbox | Hộp thư nhận | Student |
| GET | /api/contacts/sent | Đã gửi | Company |
| PUT | /api/contacts/{id}/read | Đánh dấu đã đọc | Student |

Làm thêm: like, comment (F6); /api/admin/projects, /api/admin/users (F7).

## Cách làm: API-first

Mỗi chức năng đi qua 2 PR: (1) Hợp đồng: DTO và controller trả dữ liệu mẫu trong thư mục Mock; (2) Hiện thực: logic thật, lưu DB, xóa Mock. Hợp đồng đã merge thì không đổi tên trường, đường dẫn. Frontend làm trước bằng dữ liệu giả, khi backend xong chỉ sửa trong src/api/.

## Tiến độ (21/10/2026)

- Xong: khung backend, migration, khung frontend, bản đồ, gom cụm (PR #12), form thả ghim (PR #13), hướng dẫn Copilot (PR #19).
- Đang review: PR #14, #15 (auth của Quốc), #16 (hợp đồng dự án), #17 (hợp đồng pins).
- Chờ: API pins thật để nối bản đồ theo khung nhìn.
- Còn lại: nối DB cho F1, F2, F4, F5; seed data; Postman; test case; làm thêm F6, F7; báo cáo và slide.

## Việc cần review ở PR hiện tại

- Id người dùng phải là string (OwnerDto.Id).
- Lỗi 400 phải có dạng { "message": "...", "errors": { "tenTruong": ["..."] } }.
- Phụ thuộc thẻ khác thì merge theo thứ tự.