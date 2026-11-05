# Kiến trúc

Trình duyệt (React) <-> API (ASP.NET Core) <-> SQL Server

## Backend (`backend/PortfolioMap.Api/`)

- `Controllers/`, `Dtos/<chức-năng>/`, `Services/`, `Models/`, `Data/`, `Migrations/`, `Mock/`.
- EF Core + NetTopologySuite, cột `Location` kiểu geography.
- Identity + JWT (đang làm ở PR #34).

## Frontend (`frontend/src/`)

- `features/<chức-năng>/`, `components/`, `api/`, `pages/`.
- React Router, TanStack Query, Axios, MUI, Leaflet.

## Bản đồ

- Chỉ tải ghim trong khung nhìn (bounding box) và gom cụm.

## Dữ liệu

- Mỗi người có SQL Server riêng. Chỉ cấu trúc bảng đi qua Migrations, chỉ Hải tạo.
