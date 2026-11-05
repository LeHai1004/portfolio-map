# Lỗi đã gặp

Ghi lại để không mắc lại. Mẫu: lỗi, nguyên nhân, cách sửa.

- Dấu conflict (`<<<<<<<`) bị commit trong `Program.cs` (PR #34): không build được. Cách tránh: trước khi commit, tìm `<<<<<<<` trong toàn bộ dự án.
- File ảnh chụp (`register-preview.png`) lỡ commit: không commit ảnh chụp thử.
- Thư mục `.playwright-mcp/` sinh ra khi dùng Playwright: không commit, thêm vào `.gitignore`.
- PR #16: type không hợp lệ phải trả 400 `{ message, errors }`.
