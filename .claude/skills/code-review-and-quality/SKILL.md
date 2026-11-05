---
name: code-review-and-quality
description: Tự kiểm tra code trước khi mở PR và khi review PR của người khác.
---

# Review

Trước khi gửi PR, tự trả lời:

1. Còn dấu conflict (`<<<<<<<`, `=======`, `>>>>>>>`) không?
2. Có file thừa không (ảnh chụp, `.env`, `bin`, `obj`, `node_modules`, `.playwright-mcp`)?
3. Có mật khẩu, chuỗi kết nối, khóa API trong code không?
4. Đúng hợp đồng API và dạng lỗi chưa?
5. Chỉ sửa file thuộc thẻ, dưới 300 dòng?
6. Build và lint không lỗi, đã tự chạy thử?
7. Mình tự nói lại được code làm gì không? Không thì chưa gửi PR.

Người review phải khác người viết, duyệt trong 1 ngày, phân loại lỗi: bắt buộc sửa và nên sửa.
