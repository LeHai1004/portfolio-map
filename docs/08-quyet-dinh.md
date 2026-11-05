# Quyết định

Ghi mỗi quyết định: ngày, nội dung, lý do.

- 09/10/2026: Một website duy nhất, phân vai trò Khách, Student, Company, Admin.
- Thả ghim bằng cách bấm lên bản đồ hoặc nút vị trí hiện tại. Đây là vị trí dự án, không theo dõi người dùng.
- Không dùng Redis, không chat realtime trong kế hoạch gốc, chỉ có hộp thư.
- Bản đồ nhẹ nhờ tải theo khung nhìn và gom cụm.
- Chỉ Hải tạo migration.

## Đang cân nhắc (chưa chốt)

| Phương án             | Lợi                   | Hại                        |
| --------------------- | --------------------- | -------------------------- |
| Tìm kiếm AI           | Có điểm nhấn, ít file | Cần khóa API ở backend     |
| Chatbot gợi ý         | Dễ demo               | Tốn thời gian prompt, test |
| Chat realtime SignalR | Ấn tượng              | Khó, dễ trễ tiến độ        |
| Heatmap               | Dễ                    | Ít giá trị                 |
