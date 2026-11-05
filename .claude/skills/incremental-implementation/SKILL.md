---
name: incremental-implementation
description: Làm từng bước nhỏ, mỗi bước chạy được. Dùng khi triển khai thẻ.
---

# Làm từng bước

- Mỗi bước chỉ đổi một ý, có thể chạy và kiểm tra ngay.
- Thứ tự gợi ý: Model hoặc DTO, rồi API, rồi hàm gọi API, rồi giao diện.
- Xong mỗi bước: build, chạy thử, commit nhỏ (`feat(chức-năng): ...`).
- Một thẻ một nhánh một PR, dưới 300 dòng.
- Không làm thêm thứ ngoài thẻ, không dọn code ngoài phạm vi.
- Chưa chạy được thì không sang bước sau.
