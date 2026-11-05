---
name: debugging-and-error-recovery
description: Quy trình tìm và sửa lỗi, cách gỡ khi lỡ làm sai Git.
---

# Gỡ lỗi

1. Đọc kỹ thông báo lỗi, ghi lại file và dòng.
2. Tái hiện lỗi bằng các bước cụ thể.
3. Thu hẹp: lỗi ở frontend, backend hay CSDL? Xem Network trong trình duyệt và log backend.
4. Sửa nguyên nhân gốc, không vá triệu chứng.
5. Chạy lại để xác nhận, ghi vào `docs/09-loi-da-gap.md`.

Bí quá 1 tiếng thì nhắn nhóm.

Lỡ làm sai Git:

- Lỡ commit trên `develop` (chưa push): `git branch feature/ten-dung`, `git reset --hard origin/develop`, `git checkout feature/ten-dung`.
- Sửa lời nhắn commit cuối (chưa push): `git commit --amend -m "..."`.
- Hủy thay đổi chưa commit: `git restore <file>`.
- Lỡ đẩy bí mật: báo nhóm và đổi mật khẩu ngay.
