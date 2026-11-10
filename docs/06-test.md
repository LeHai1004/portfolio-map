# Test

Cách thử: Scalar tại `/scalar/v1` hoặc giao diện web.

| Mã   | Chức năng              | Các bước                                    | Kết quả mong đợi                  | Kết quả thật |
| ---- | ---------------------- | ------------------------------------------- | --------------------------------- | ------------ |
| T-01 | Đăng ký                | Gửi email, mật khẩu, họ tên, vai trò hợp lệ | 201, tạo tài khoản                |              |
| T-02 | Đăng ký trùng email    | Đăng ký lại email đã có                     | 409, `{ message, errors }`        |              |
| T-03 | Đăng nhập sai mật khẩu | Gửi sai mật khẩu                            | 401 hoặc 400                      |              |
| T-04 | Thả ghim               | Student gửi dự án hợp lệ                    | 201, ghim hiện trên bản đồ        |              |
| T-05 | Thả ghim type sai      | Gửi type không hợp lệ                       | 400, `{ message, errors }`        |              |
| T-06 | Sửa dự án người khác   | Student sửa dự án không phải của mình       | 403                               |              |
| T-07 | Sửa dự án Mobile       | Mở form sửa dự án Mobile                    | Hiện đúng Mobile, không thành Web |              |
| T-08 | Xem hồ sơ công khai    | GET `/api/users/{id}` của Student             | 200, trả hồ sơ public và profile Student từ DB, không có email | Chưa chạy: cần SQL Server và API |
| T-09 | Hồ sơ không tồn tại   | GET `/api/users/not-found`                    | 404, `{ message, errors }`        | Chưa chạy: cần SQL Server và API |
| T-10 | Cập nhật hồ sơ        | Có token Student, PUT `/api/users/me` với body hợp lệ | 200, DB và response có thông tin mới | Chưa chạy: cần SQL Server, JWT và API |
| T-11 | Chưa đăng nhập        | Không token, PUT `/api/users/me`              | 401, `{ message, errors }`        | Chưa chạy: cần khởi động API |
| T-12 | Đổi mật khẩu không hợp lệ | Có token, mật khẩu mới dưới 8 ký tự hoặc xác nhận sai | 400, `{ message, errors }` | Chưa chạy: cần SQL Server, JWT và API |
| T-13 | Đổi mật khẩu sai hiện tại | Có token, gửi `currentPassword` sai           | 400, `{ message, errors }`        | Chưa chạy: cần SQL Server, JWT và API |
| T-14 | Đổi mật khẩu          | Có token, PUT `/api/users/me/password` với dữ liệu hợp lệ | 200, đăng nhập được bằng mật khẩu mới | Chưa chạy: cần SQL Server, JWT và API |
| T-15 | Tải ảnh đại diện      | Có token, POST `/api/users/me/avatar` với JPEG/PNG hợp lệ | 200, trả URL và ảnh được lưu, truy cập được | Chưa chạy: cần SQL Server, JWT và API |
| T-16 | Tải file không phải ảnh | Có token, upload file sai đuôi hoặc chữ ký ảnh | 400, `{ message, errors }`     | Chưa chạy: cần JWT và API |
