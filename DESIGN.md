# Thiết kế giao diện Portfolio Map

Mọi người (và AI) làm giao diện phải theo file này.

## 1. Cảm giác chung

- Hiện đại, sạch, nhiều khoảng trắng; bản đồ là trung tâm, giao diện không che bản đồ.
- Có hỗ trợ chế độ sáng và tối (dùng theme của MUI).

## 2. Màu (khai báo trong theme MUI, không gõ mã màu rải rác)

- primary: tím #7C3AED (nút chính, ghim đang chọn)
- secondary: xanh #0EA5E9 (liên kết, điểm nhấn phụ)
- success #16A34A, warning #F59E0B, error #DC2626
- Nền sáng #FFFFFF / #F8FAFC; nền tối #0F1117 / #181B23
- Ghim theo loại dự án: Web xanh, Mobile tím, Game cam, AI hồng, Khác xám

## 3. Chữ

- Font Inter (dự phòng system-ui). Tiêu đề 600, nội dung 400.
- Cỡ: h1 32, h2 24, h3 20, nội dung 16, chú thích 13.

## 4. Khoảng cách và bo góc

- Bước 8px (8, 16, 24, 32). Bo góc 12px cho thẻ, 8px cho nút và ô nhập.
- Đổ bóng nhẹ cho thẻ; không viền đậm.

## 5. Thành phần

- Thẻ dự án: ảnh thumbnail trên, tiêu đề, loại, tối đa 3 tag, lượt xem.
- Hộp xem nhanh trên bản đồ: ảnh, tiêu đề, nút "Xem chi tiết".
- Nút chính 1 cái mỗi màn hình; nút phụ dạng outlined.
- Form: nhãn rõ, báo lỗi ngay dưới ô nhập, nút gửi bị khóa khi đang gửi.

## 6. Trạng thái bắt buộc có

- Đang tải: Skeleton (không dùng chữ "Loading...").
- Rỗng: icon + câu giải thích + nút hành động.
- Lỗi: Snackbar hoặc Alert hiện `message` từ API.

## 7. Hiệu ứng (nhẹ, tinh tế)

- Chuyển trạng thái 150–250ms, easing ease-out.
- Hover thẻ: nâng nhẹ 2–4px + bóng đậm hơn.
- Trang và hộp thoại: fade + trượt nhẹ khi hiện.
- Ghim: phóng nhẹ khi hover/chọn. KHÔNG animate hàng loạt ghim (làm bản đồ giật).
- Phải tôn trọng `prefers-reduced-motion` (tắt hiệu ứng nếu người dùng bật).

## 8. Responsive

- Điểm gãy MUI: 600 / 900 / 1200.
- Điện thoại: bản đồ toàn màn hình, bộ lọc và chi tiết dạng ngăn kéo từ dưới lên.
- Nút bấm tối thiểu 44px.

## 9. Truy cập (a11y)

- Tương phản chữ đủ đọc; ảnh có `alt`; mọi nút bấm được bằng bàn phím và có focus rõ.
