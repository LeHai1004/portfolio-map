---
name: api-and-interface-design
description: Thiết kế và viết API theo hợp đồng đã chốt. Dùng khi tạo controller, DTO, endpoint.
---

# API

- Đường dẫn bắt đầu `/api`, danh từ số nhiều, chữ thường. GET lấy, POST thêm, PUT sửa, DELETE xóa.
- JSON camelCase.
- Mã trạng thái: 200, 201, 400, 401, 403, 404, 409.
- Lỗi luôn dạng `{ "message": "...", "errors": { "tênTrường": "..." } }`.
- Danh sách dài có phân trang: nhận `page`, `pageSize`; trả `items`, `page`, `pageSize`, `totalItems`.
- DTO đặt ở `Dtos/<chức-năng>/` tên `ViệcRequest` hoặc `ViệcResponse`. Service là `IXService` và `XService`.
- Mỗi chức năng 2 PR: Hợp đồng (DTO, controller trả dữ liệu mẫu) rồi Hiện thực (logic thật, lưu DB).
- Hợp đồng đã merge thì không tự đổi tên trường hay đường dẫn. Muốn đổi: tạo thẻ "Đổi hợp đồng" và báo nhóm.
- Danh sách API chuẩn nằm ở tài liệu khởi động, phần 5.
