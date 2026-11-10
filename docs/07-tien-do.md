# Tiến độ

Cập nhật lần cuối: 10/11/2026. Mỗi lần xong việc thì sửa file này.

## Đang chờ người khác

- Quốc: sửa PR #34 (auth pages). Lỗi bắt buộc: `Program.cs` còn dấu conflict `<<<<<<<`, `=======`, `>>>>>>>` bị commit nên không build được. Cần giữ cấu hình mật khẩu khớp dòng hướng dẫn ở RegisterPage. Nghi file thừa `frontend/src/features/auth/register-preview.png`, không nên commit.
- Sỹ: sửa PR #16 (type không hợp lệ phải trả 400 `{ message, errors }`), sau đó PR #17.
- Quang: làm API F5 (công ty, liên hệ).
- Sơn: làm API F4 (tìm kiếm, lọc).

## Việc của Hải

- Review PR #34 khi Quốc sửa xong (chưa Approve).
- Kiểm tra form sửa dự án: dự án Mobile có bị hiện thành Web không.
- S3-03: làm đẹp, responsive.
- Họp nhóm chốt phạm vi nâng cấp AI.

## Đã xong

- Hồ sơ công khai: bỏ email khỏi response; build backend thành công. T-08–T-16 chưa chạy qua Scalar vì API chưa khởi động.
- Dọn nhánh máy Hải, còn develop, main, pr-16.
- Trello: các thẻ S2-07, S1-13, S1-15, S1-16, S1-17, S1-18, Dự án của tôi, Chế độ sửa dự án, review #33 đã sang Xong.

## Đang phân vân (chưa chốt, cần họp nhóm)

- Đề xuất thêm: Tìm kiếm AI (Sơn), Chatbot gợi ý (Sỹ, Quang). Khuyến nghị chốt 2 thứ này.
- Ý tưởng khác: AI viết mô tả từ GitHub (Quốc), chat realtime SignalR (Quang, khó), heatmap (Sỹ, dễ).
- Khóa API AI chỉ để ở backend, không commit.
- Chưa ai đồng ý, không làm trước khi họp.

## Việc tiếp theo

1. Họp nhóm chốt phạm vi AI.
2. Sau họp: cập nhật tài liệu khởi động, thẻ Trello, danh sách API.
3. Figma Make: tạo mockup toàn bộ trang (tài khoản Hải hết credit AI đến 1/11).
