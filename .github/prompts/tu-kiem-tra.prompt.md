---
name: tu-kiem-tra
description: Chỉ rà soát diff theo quy ước Portfolio Map và báo cáo phát hiện, không chỉnh sửa.
agent: agent
---

Chỉ kiểm tra và báo cáo các thay đổi hiện có. Tuyệt đối không sửa, tạo, xóa hoặc định dạng lại file; không tự chạy lệnh có thể thay đổi worktree.

Chạy `git diff` để xem thay đổi chưa staged. Kiểm tra thêm `git diff --cached` và `git status --short` để nhận diện thay đổi staged và file mới; nếu cần, đọc file mới để review nội dung. Không làm mất hoặc ghi đè thay đổi của người dùng.

Soát các mục sau:

- Tên file và cách tổ chức có đúng `docs/QUY-UOC.md` không.
- TypeScript có dùng `any` không.
- Component có viết cứng mã màu thay vì dùng MUI theme không.
- Animation có đúng `docs/UI-UX.md`: chỉ `transform`/`opacity`, tôn trọng `prefers-reduced-motion`, không chạy khi kéo hoặc zoom bản đồ không.
- Có file nào ngoài danh sách được phép của thẻ bị sửa hoặc tạo không.
- Tổng số dòng thêm và xóa có dưới 300 dòng không.
- Có `console.log` hoặc import không dùng không.

Chỉ nêu phát hiện có bằng chứng từ diff/file được review; không suy đoán. Trả lời bằng tiếng Việt, chia kết quả thành đúng hai mục:

## Bắt buộc sửa

Liệt kê lỗi cần sửa, kèm file và vị trí nếu xác định được. Nếu không có, ghi “Không phát hiện.”

## Góp ý nhỏ

Liệt kê đề xuất không bắt buộc. Nếu không có, ghi “Không có.”
