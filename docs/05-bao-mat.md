# Bảo mật

- Không commit `.env`, `appsettings.Development.json`, chuỗi kết nối, khóa API, `.playwright-mcp/`.
- Khóa JWT (`JwtSettings:Key`) dài ít nhất 32 byte, để trong cấu hình riêng của máy.
- Khóa API AI (nếu làm) chỉ để ở backend, không bao giờ để trong frontend.
- Mật khẩu luôn được mã hóa (Identity), không lưu chữ thường.
- Kiểm tra quyền ở mọi API: Public, Login, Student, Company, Admin.
- Chỉ chủ dự án mới sửa, xóa dự án của mình (Admin được xóa).
- Lỡ đẩy bí mật lên GitHub: báo nhóm ngay và đổi mật khẩu, khóa đó.
