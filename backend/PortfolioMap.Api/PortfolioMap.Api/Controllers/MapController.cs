using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Map;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Mock;

namespace PortfolioMap.Api.Controllers;

/// <summary>
/// HỢP ĐỒNG API bản đồ (dữ liệu mẫu trong bộ nhớ, chưa truy cập DB).
/// Ghim lấy từ MockProjectData nên id khớp GET /api/projects/{id}.
/// </summary>
[ApiController]
[Route("api/map")]
public class MapController : ControllerBase
{
    private const int MaxPins = 500;

    /// <summary>
    /// Lấy các ghim trong khung đang nhìn. Quyền: Public.
    /// Bắt buộc: minLat, maxLat, minLng, maxLng. Tùy chọn: type (Web, Mobile, Game, AI, Other), tag (id).
    /// Lọc trên dữ liệu mẫu: trong khung (gồm biên), đúng type, có tag, bỏ dự án bị ẩn. Tối đa 500 ghim.
    /// </summary>
    [HttpGet("pins")]
    [ProducesResponseType(typeof(IReadOnlyList<PinDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public ActionResult<IReadOnlyList<PinDto>> GetPins(
        [FromQuery] double? minLat,
        [FromQuery] double? maxLat,
        [FromQuery] double? minLng,
        [FromQuery] double? maxLng,
        [FromQuery] string? type,
        [FromQuery] int? tag)
    {
        var errors = new Dictionary<string, string[]>();

        if (minLat is null) errors["minLat"] = new[] { "Thiếu tham số minLat" };
        if (maxLat is null) errors["maxLat"] = new[] { "Thiếu tham số maxLat" };
        if (minLng is null) errors["minLng"] = new[] { "Thiếu tham số minLng" };
        if (maxLng is null) errors["maxLng"] = new[] { "Thiếu tham số maxLng" };
        if (errors.Count > 0)
            return BadRequest(new ApiErrorResponse("Thiếu tham số khung bản đồ", errors));

        if (minLat > maxLat) errors["minLat"] = new[] { "minLat không được lớn hơn maxLat" };
        if (minLng > maxLng) errors["minLng"] = new[] { "minLng không được lớn hơn maxLng" };

        // type chỉ nhận đúng tên: số (1, 99) hay chuỗi lạ đều bị từ chối.
        ProjectType? typeFilter = null;
        if (!string.IsNullOrWhiteSpace(type))
        {
            if (IsValidType(type))
                typeFilter = Enum.Parse<ProjectType>(type.Trim(), ignoreCase: true);
            else
                errors["type"] = new[] { "Loại dự án không hợp lệ. Chỉ nhận: Web, Mobile, Game, AI, Other" };
        }

        if (errors.Count > 0)
            return BadRequest(new ApiErrorResponse("Dữ liệu gửi lên không hợp lệ", errors));

        double south = minLat!.Value, north = maxLat!.Value, west = minLng!.Value, east = maxLng!.Value;

        var pins = MockProjectData.Projects
            .Where(p => !MockProjectData.IsHidden(p.Id))
            .Where(p => p.Latitude >= south && p.Latitude <= north
                     && p.Longitude >= west && p.Longitude <= east)
            .Where(p => typeFilter is null || p.Type == typeFilter)
            .Where(p => tag is null || p.Tags.Any(t => t.Id == tag))
            .OrderBy(p => p.Id)
            .Select(p => new PinDto(p.Id, p.Title, p.Latitude, p.Longitude, p.Type, p.ThumbnailUrl))
            .Take(MaxPins)
            .ToList();

        return Ok(pins);
    }

    /// <summary>Chỉ nhận đúng tên (không phân biệt hoa thường), không nhận số hay chuỗi ghép.</summary>
    private static bool IsValidType(string raw) =>
        Enum.GetNames<ProjectType>().Contains(raw.Trim(), StringComparer.OrdinalIgnoreCase);
}