# Quy chuẩn UI/UX Portfolio Map

Phong cách giao diện của Portfolio Map hiện đại, sáng và gọn, giúp người dùng tập trung vào bản đồ và các dự án.

## Màu sắc và giao diện

- Màu chính: indigo `#4F46E5`.
- Màu phụ: cyan `#06B6D4`.
- Nền trang: `#F8FAFC`; nền card: trắng.
- Chữ chính: `#0F172A`; chữ phụ: `#475569`.
- Nút chính và điểm nhấn có thể dùng gradient nhẹ từ indigo sang cyan.
- Bo góc card và khu vực nội dung: 16px; dùng bóng mềm, không tạo cảm giác nặng.
- Khoảng cách theo bội số 8px (8, 16, 24, 32px).
- Dùng font hệ thống; không cài thêm font.
- Khai báo màu và cỡ chữ trong MUI theme tại `src/theme.ts` (thực hiện trong PR riêng). Component chỉ dùng giá trị từ theme, không viết cứng mã màu.

## Chuyển động và trạng thái tải

- Khi vào trang: fade kết hợp trượt lên 8-12px, thời lượng 250ms.
- Card khi hover: nổi lên 2-4px.
- Nút khi nhấn: scale về 0.98.
- Danh sách có thể hiện lần lượt, mỗi mục cách nhau 40ms.
- Khi dữ liệu đang tải, hiển thị skeleton phù hợp với bố cục nội dung.
- Chỉ animate `transform` và `opacity`; không animate `width`, `height`, `top`, `left` hoặc thuộc tính bố cục khác.
- Luôn tôn trọng `prefers-reduced-motion`, tắt hoặc giảm chuyển động khi người dùng yêu cầu giảm chuyển động.
- Không chạy animation khi người dùng đang kéo hoặc zoom bản đồ.

## Mẫu thành phần

### Card dự án

Card nền trắng, bo góc 16px, bóng mềm và khoảng đệm theo bội số 8px. Hiển thị ảnh thumbnail, tiêu đề dễ đọc, loại dự án, một vài tag và thông tin chủ dự án. Khi hover, card chỉ nổi nhẹ 2-4px bằng `transform`; ảnh không làm thay đổi kích thước bố cục.

### Nút chính và nút phụ

- Nút chính dùng màu indigo hoặc gradient nhẹ indigo-cyan, chữ có độ tương phản rõ, bo góc theo hệ thống theme. Khi nhấn, scale về 0.98.
- Nút phụ dùng nền/trạng thái trung tính lấy từ theme, không cạnh tranh với nút chính; ưu tiên kiểu viền hoặc chữ.
- Cả hai loại nút có trạng thái hover, focus, disabled và loading dễ nhận biết; không gán mã màu trực tiếp trong component.

### Chip tag

Chip nhỏ gọn, bo tròn, dùng nền và màu chữ nhẹ lấy từ palette MUI theme. Giữ khoảng cách đều, cho phép xuống dòng trên màn hình hẹp và không làm tràn card.

### Panel xem nhanh khi bấm ghim

Panel nổi cạnh hoặc phía dưới ghim tùy không gian bản đồ; nền trắng, bo góc 16px, bóng mềm. Hiển thị thumbnail, tên dự án, loại, chủ dự án, một vài tag và hành động mở trang chi tiết. Panel không cản thao tác kéo/zoom bản đồ ngoài vùng nội dung của nó; khi hiện/ẩn chỉ dùng fade và `transform`, đồng thời tuân thủ `prefers-reduced-motion`.
