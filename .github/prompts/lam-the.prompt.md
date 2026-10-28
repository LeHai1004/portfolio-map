---
name: lam-the
description: Thực hiện một thẻ phát triển theo quy ước Portfolio Map và danh sách file được phép.
agent: agent
---

Thực hiện thẻ `${input:maThe}`.

- Tiêu đề: `${input:tieuDe}`
- Mô tả/yêu cầu: `${input:moTa}`
- File được phép tạo hoặc sửa: `${input:fileDuocPhep}`

Trước khi làm:

1. Đọc `docs/QUY-UOC.md`, `docs/TONG-QUAN.md`, `docs/UI-UX.md`, `docs/TIEN-DO.md` và `.github/instructions/frontend.instructions.md`.
2. Kiểm tra trạng thái Git và đọc các file liên quan trong phạm vi được phép để giữ nguyên thay đổi có sẵn.
3. Nếu thiếu hoặc không rõ mã thẻ, tiêu đề, mô tả, danh sách file được phép, hợp đồng API hoặc lựa chọn ảnh hưởng đáng kể đến hành vi, hãy hỏi người dùng và chờ trả lời trước khi sửa.

Khi thực hiện:

- Chỉ tạo hoặc sửa các file có trong danh sách được phép. Không tự ý thay đổi file khác; nếu cần file ngoài danh sách thì hỏi người dùng trước.
- Làm đúng hợp đồng API và các quy ước đã đọc; không đổi tên trường hoặc đường dẫn đã chốt.
- Với frontend, dùng TypeScript chặt, không dùng `any`; dùng Axios và TanStack Query theo cấu trúc hiện có.
- Dùng MUI theme thay vì viết cứng màu hoặc cỡ chữ trong component; không cài thư viện mới.
- Giữ thay đổi nhỏ, rõ ràng, dưới 300 dòng; không sửa hoặc xóa thay đổi có sẵn ngoài phạm vi thẻ.

Sau khi hoàn tất, chạy `npm run build` và `npm run lint` từ thư mục `frontend/`. Báo chính xác lệnh và kết quả; nếu lệnh thất bại, xử lý lỗi do thay đổi của thẻ nếu có thể và chạy lại. Cuối cùng giải thích ngắn bằng tiếng Việt từng file đã tạo hoặc sửa và nêu các kiểm tra đã chạy.
