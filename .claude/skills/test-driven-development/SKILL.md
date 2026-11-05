---
name: test-driven-development
description: Viết test case trước hoặc song song khi làm chức năng.
---

# Test

- Mỗi chức năng có test case trong `docs/06-test.md`: bước làm, dữ liệu vào, kết quả mong đợi.
- Luôn có cả trường hợp lỗi: thiếu dữ liệu, sai quyền (403), chưa đăng nhập (401), trùng (409), không thấy (404).
- Thử bằng Scalar (`/scalar/v1`) hoặc giao diện, ghi kết quả thật vào bảng.
- Lỗi tìm thấy thì ghi vào `docs/09-loi-da-gap.md` sau khi sửa.
- Trước khi nộp: test trên một máy sạch.
