# Quy ước làm việc nhóm Portfolio Map

Đọc một lần trước khi code. Mọi người (và AI của mọi người) đều làm theo file này.

## 0. Năm điều quan trọng nhất

1. Không làm việc trực tiếp trên `main` hoặc `develop`. Luôn tạo nhánh riêng.
2. Tên nhánh lấy y nguyên từ thẻ Trello (mục Nhánh), không tự nghĩ tên khác.
3. Một thẻ = một nhánh = một Pull Request.
4. Không đẩy mật khẩu, chuỗi kết nối, file `.env` lên GitHub.
5. Chưa hiểu code thì chưa gửi PR. Hỏi nhóm hoặc nhờ AI giải thích cho tới khi tự nói lại được.

## 1. Tên nhánh

Công thức: `loại/chức-năng-việc-làm`

- loại: `feature` (làm mới), `fix` (sửa lỗi), `docs` (tài liệu), `chore` (cấu hình, cài thư viện)
- Toàn bộ viết thường, không dấu, không khoảng trắng, nối bằng gạch ngang.

| Đúng                           | Sai                          | Vì sao sai                      |
| ------------------------------ | ---------------------------- | ------------------------------- |
| feature/auth-register-contract | Feature/Auth-Register        | Có chữ hoa                      |
| feature/map-cluster            | feature/làm bản đồ           | Có dấu và khoảng trắng          |
| fix/map-pin-not-show           | fix-map                      | Thiếu dấu gạch chéo, tên mơ hồ  |
| feature/projects-create        | quoc-test                    | Là tên người, không nói rõ việc |
| docs/quy-uoc                   | new-branch, test, abc        | Không biết làm gì               |
| feature/company-save-project   | feature/company_save project | Dấu gạch dưới, khoảng trắng     |

Tên nhánh đã ghi sẵn trong thẻ Trello, chỉ việc copy.

### Lỡ đặt sai tên nhánh

Chưa push lên GitHub:

```
git branch -m ten-sai ten-dung
```

Đã push lên GitHub:

```
git branch -m ten-sai ten-dung
git push -u origin ten-dung
git push origin --delete ten-sai
```

Nếu đã tạo Pull Request từ nhánh cũ thì đóng PR đó và tạo lại từ nhánh mới.

## 2. Commit

Công thức: `loại(chức-năng): mô tả ngắn`

| Đúng                                         | Sai           |
| -------------------------------------------- | ------------- |
| feat(auth): thêm API đăng ký trả dữ liệu mẫu | update        |
| fix(map): sửa lỗi ghim không hiện khi zoom   | fix lung tung |
| docs: cập nhật danh sách API                 | abc           |
| chore: cài thư viện react-leaflet            | done          |

- Loại: feat (thêm chức năng), fix (sửa lỗi), docs (tài liệu), style (chỉnh giao diện nhỏ), refactor (viết lại cho gọn), chore (việc lặt vặt).
- Commit nhỏ, thường xuyên. Mỗi commit một ý.

## 3. Pull Request (PR)

- Tiêu đề giống tiêu đề thẻ Trello. Ví dụ: `[F1][BE] Hợp đồng API register`
- Đích của PR là `develop`, không phải `main`.
- Khoảng 500 dòng; PR tài liệu, giao diện và file sinh tự động (migration) không tính chặt; PR logic backend nên nhỏ để dễ review.
- PR vào `develop` dùng **Squash merge**; PR vào `main` dùng **Merge**.
- Điền đủ mẫu mô tả (tự hiện ra nhờ file `.github/pull_request_template.md`).
- Người duyệt phải khác người viết. Duyệt trong vòng 1 ngày.
- Người duyệt hỏi một câu về code mà người viết không trả lời được thì chưa merge.

### Thẻ phụ thuộc nhau

- Nếu thẻ cần code của thẻ khác, chờ thẻ phụ thuộc được merge rồi mới tạo nhánh từ `develop` mới nhất.
- Không tách nhánh từ nhánh của người khác.
- Merge PR theo đúng thứ tự phụ thuộc.

### Cách review PR

1. Checkout nhánh của PR và đọc đúng các file thuộc PR.
2. Đối chiếu thay đổi với hợp đồng API và quy ước của nhóm.
3. Chia góp ý thành:
   - **Bắt buộc sửa**: sai hợp đồng, sai quy ước hoặc gây lỗi thật.
   - **Không bắt buộc**: góp ý cải thiện nhưng không gây lỗi và không vi phạm quy ước.

## 4. Đặt tên file, class, thư mục

### Backend (C#)

| Loại         | Quy ước                                                  | Ví dụ                              |
| ------------ | -------------------------------------------------------- | ---------------------------------- |
| Controller   | TênChứcNăngController                                    | AuthController, ProjectsController |
| DTO          | ViệcRequest hoặc ViệcResponse, đặt trong Dtos/chức-năng/ | Dtos/Auth/RegisterRequest.cs       |
| Service      | IXService và XService, đặt trong Services/               | IAuthService, AuthService          |
| Model (bảng) | Số ít, đặt trong Models/                                 | Project, Tag                       |

- Đường dẫn API: số nhiều, viết thường: `/api/projects`.
- JSON dùng camelCase: `fullName`, `thumbnailUrl`.

### Frontend (React)

| Loại             | Quy ước        | Ví dụ                             |
| ---------------- | -------------- | --------------------------------- |
| Trang, component | PascalCase.tsx | RegisterPage.tsx, ProjectCard.tsx |
| Hàm gọi API      | tênApi.ts      | authApi.ts                        |
| Hook             | useTên.ts      | useProjects.ts                    |
| Thư mục          | Chữ thường     | features/auth                     |

- `src/features/<chức năng>/` chỉ chứa file của chức năng đó.
- Thứ dùng chung nhiều chức năng thì để ở `src/components/` hoặc `src/api/`, và chỉ sửa qua PR nhỏ, báo nhóm trước.

## 5. API: lỗi, hợp đồng

- Mã trạng thái: 200 ok, 201 tạo mới, 400 dữ liệu sai, 401 chưa đăng nhập, 403 không đủ quyền, 404 không thấy, 409 trùng.
- Lỗi luôn trả cùng một dạng, ví dụ:

```
{ "message": "Dữ liệu không hợp lệ", "errors": { "email": ["Email đã tồn tại"] } }
```

- Id người dùng luôn có kiểu `string`.
- Danh sách dài thì phân trang: gửi `page`, `pageSize`; nhận `items`, `page`, `pageSize`, `totalItems`.
- Mỗi chức năng đi qua 2 PR. PR 1 là Hợp đồng (DTO và controller trả dữ liệu mẫu trong thư mục `Mock`). PR 2 là Hiện thực (logic thật, lưu DB); khi nối DB phải xóa dữ liệu mẫu trong `Mock`.
- Hợp đồng đã merge thì không ai tự ý đổi tên trường hay đường dẫn. Muốn đổi thì tạo thẻ có nhãn Đổi hợp đồng và báo nhóm.

## 6. Dùng AI

- Dán nguyên file này vào đầu lời nhắn trước khi nhờ AI viết code.
- Mẫu lời nhắn:

```
Đây là quy ước của nhóm: (dán file này).
Thẻ của tôi: (dán nội dung thẻ Trello).
Hãy viết đúng các file trong mục File, đúng hợp đồng trong mục Hợp đồng,
không đổi đường dẫn và tên trường đã chốt, không sửa file ngoài danh sách.
Sau đó giải thích từng file làm gì để tôi hiểu.
```

- Đọc từng file AI viết, xóa phần thừa, chạy thử rồi mới commit.
- Không để AI tự đổi cấu trúc thư mục, tên DTO đã chốt, hay file dùng chung.

## 7. Lỡ làm sai thì sửa thế nào

Lỡ commit trên `develop` (chưa push):

```
git branch feature/ten-dung
git reset --hard origin/develop
git checkout feature/ten-dung
```

Sửa lời nhắn commit cuối (chưa push):

```
git commit --amend -m "feat(auth): lời nhắn mới"
```

Hủy thay đổi chưa commit trong một file:

```
git restore duong-dan/file
```

Bị conflict: xem tài liệu khởi động, mục 7.8, và gọi người sửa file kia.

Lỡ đẩy mật khẩu hay chuỗi kết nối lên GitHub: báo nhóm ngay và đổi mật khẩu đó.

## 8. Những điều cấm

- Push thẳng lên `main` hoặc `develop`.
- `git push --force`.
- Commit `node_modules`, `bin`, `obj`, `.env`, `appsettings.Development.json`.
- Sửa file của chức năng người khác khi chưa báo.
- Merge PR của chính mình khi chưa ai duyệt.

## 9. Cơ sở dữ liệu

- Mỗi người có SQL Server riêng trên máy mình. Dữ liệu không đồng bộ giữa các máy, chỉ cấu trúc bảng (migration) đi qua Git.
- Chỉ Hải tạo migration. Cần thêm hoặc sửa bảng thì nhắn Hải hoặc ghi vào thẻ.
- Sau mỗi lần `git pull` mà thấy có file mới trong thư mục `Migrations`, chạy `Update-Database`.
- Không sửa cấu trúc bảng bằng tay trong SSMS.
