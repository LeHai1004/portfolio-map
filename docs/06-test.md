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
