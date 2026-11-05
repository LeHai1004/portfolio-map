# Quy ước code

Bản đầy đủ: `docs/QUY-UOC.md`. Tóm tắt:

- Nhánh: `loại/chức-năng-việc-làm`, chữ thường, không dấu.
- Commit: `loại(chức-năng): mô tả ngắn`.
- PR: đích `develop`, dưới 300 dòng, người duyệt khác người viết.
- Backend: `XController`, `IXService`/`XService`, DTO `ViệcRequest`/`ViệcResponse`, model số ít.
- Frontend: `PascalCase.tsx` cho trang và component, `tênApi.ts`, `useTên.ts`.
- API: đường dẫn số nhiều thường, JSON camelCase, lỗi dạng `{ "message", "errors" }`.
- Mỗi chức năng 2 PR: Hợp đồng rồi Hiện thực.
