---
applyTo: "frontend/**"
---
# Luật cho frontend (Agent đọc trước khi làm)

- Chỉ sửa file thuộc thẻ tôi đang làm. Muốn sửa file ngoài thẻ thì hỏi trước.
- File dùng chung (package.json, main.tsx, src/components/, cấu hình Axios) chỉ sửa khi tôi nói rõ.
- Gọi dữ liệu qua src/api/*.ts bằng Axios và TanStack Query. Backend chưa có thì dùng dữ liệu giả đúng dạng hợp đồng trong docs/TONG-QUAN.md, để trong src/api/. Component không được biết dữ liệu là giả hay thật.
- Màu, cỡ chữ, khoảng cách lấy từ theme MUI, không viết cứng mã màu.
- Animation: chỉ animate transform và opacity, 150 đến 300ms, tôn trọng prefers-reduced-motion, không animate khi người dùng đang kéo hoặc zoom bản đồ.
- TypeScript chặt, không dùng any. Tên file theo docs/QUY-UOC.md.
- Không cài thư viện mới khi chưa hỏi. Mỗi lần chỉ làm một việc nhỏ, dưới 300 dòng thay đổi.
- Làm xong, giải thích ngắn từng file đã sửa bằng tiếng Việt.