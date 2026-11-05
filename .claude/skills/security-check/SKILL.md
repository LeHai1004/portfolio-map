---
name: security-check
description: Kiểm tra bảo mật cơ bản trước khi mở PR. Dùng khi đụng tới đăng nhập, phân quyền, cấu hình, khóa API.
---

# Bảo mật

- Không commit `.env`, `appsettings.Development.json`, chuỗi kết nối, khóa API, khóa JWT.
- Khóa JWT dài ít nhất 32 byte, nằm ở cấu hình riêng của máy.
- Khóa API AI (nếu làm) chỉ ở backend, không bao giờ trong frontend.
- Mật khẩu chỉ được mã hóa bởi Identity, không lưu hay ghi log chữ thường.
- Mọi API có đúng quyền: Public, Login, Student, Company, Admin.
- Chỉ chủ dự án sửa, xóa dự án của mình (Admin được xóa).
- Kiểm tra dữ liệu vào ở backend, không tin frontend.
- Không trả thông tin nhạy cảm (PasswordHash, SecurityStamp) trong JSON.
