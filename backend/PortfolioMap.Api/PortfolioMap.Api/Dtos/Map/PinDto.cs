using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Dtos.Map;

/// <summary>
/// Dữ liệu ghim nhẹ cho bản đồ. Cố ý dùng lat/lng (ngắn gọn),
/// khác với chi tiết dự án dùng latitude/longitude. Không đổi.
/// </summary>
public record PinDto(
    int Id,
    string Title,
    double Lat,
    double Lng,
    ProjectType Type,
    string? ThumbnailUrl);