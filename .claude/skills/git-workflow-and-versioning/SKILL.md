---
name: git-workflow-and-versioning
description: Quy trình Git của nhóm. Dùng khi tạo nhánh, commit, PR.
---

# Git

- Không làm trên `main` hoặc `develop`. Tên nhánh lấy y nguyên từ thẻ Trello: `loại/chức-năng-việc-làm`, chữ thường, không dấu.
- Mỗi ngày: `git checkout develop`, `git pull origin develop`, rồi `git checkout -b <nhánh>`.
- Commit: `loại(chức-năng): mô tả ngắn`, loại gồm feat, fix, docs, style, refactor, chore.
- PR đích `develop`, tiêu đề giống thẻ Trello, điền đủ mẫu PR.
- Sau mỗi `git pull`, nếu có file mới trong `Migrations` thì chạy `Update-Database`.
- Cấm: push thẳng `main` hoặc `develop`, `git push --force`, commit `node_modules`, `bin`, `obj`, `.env`.
- Merge bằng Squash and merge sau khi có Approve.
