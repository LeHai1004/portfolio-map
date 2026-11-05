---
name: frontend-ui-engineering
description: Viết giao diện React đúng cấu trúc và quy ước của dự án. Dùng khi tạo hoặc sửa trang, component.
---

# Frontend UI

- Mã nguồn ở `frontend/src/features/<chức-năng>/`. Thứ dùng chung ở `src/components/`, `src/api/`, chỉ sửa qua PR nhỏ và báo nhóm.
- Tên file: `PascalCase.tsx` cho trang và component, `tênApi.ts`, `useTên.ts`.
- Dùng MUI cho nút, form, bảng. Gọi API bằng Axios, nhớ dữ liệu bằng TanStack Query.
- Địa chỉ API lấy từ `VITE_API_URL`, không viết cứng.
- Mọi màn hình có đủ 3 trạng thái: đang tải, lỗi, không có dữ liệu.
- Lỗi từ API dạng `{ message, errors }`: hiện `message` chung và `errors` theo từng ô.
- Hiển thị tốt trên điện thoại.
- Xong thì chạy `npm run lint` và `npm run build`.
