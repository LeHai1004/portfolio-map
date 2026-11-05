---
name: performance-optimization
description: Giữ bản đồ và API nhẹ khi có nhiều ghim. Dùng khi làm bản đồ, tìm kiếm, truy vấn.
---

# Hiệu năng

- Bản đồ chỉ tải ghim trong khung đang nhìn (minLat, maxLat, minLng, maxLng), có độ trễ nhỏ khi kéo bản đồ.
- API pins chỉ trả dữ liệu nhẹ: id, title, lat, lng, type, thumbnailUrl.
- Gom cụm bằng react-leaflet-cluster.
- Truy vấn khoảng cách dùng cột `Location` (geography), không tính tay trong code.
- Danh sách luôn phân trang. Tránh tải cả bảng rồi lọc trong bộ nhớ.
- Thử với khoảng 300 ghim mẫu trước khi báo xong.
- Không thêm cache hay Redis khi chưa có số đo chứng minh cần.
