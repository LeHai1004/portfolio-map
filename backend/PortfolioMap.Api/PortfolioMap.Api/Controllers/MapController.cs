using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Map;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Mock;

namespace PortfolioMap.Api.Controllers;

/// <summary>
/// HỢP ĐỒNG API bản đồ (trả dữ liệu mẫu, chưa truy cập DB, chưa lọc thật).
/// Ghim dùng lại 5 dự án của MockProjectData nên id khớp GET /api/projects/{id}.
/// </summary>
[ApiController]
[Route("api/map")]
public class MapController : ControllerBase
{
    private const int MaxPins = 500;

    /// <summary>
    /// Lấy các ghim trong khung đang nhìn. Quyền: Public.
    /// Bắt buộc: minLat, maxLat, minLng, maxLng. Tùy chọn: type, tag (id).
    /// Bản mẫu chưa lọc theo khung, type, tag mà luôn trả 5 ghim.
    /// </summary>
    [HttpGet("pins")]
    [ProducesResponseType(typeof(IReadOnlyList<PinDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    public ActionResult<IReadOnlyList<PinDto>> GetPins(
        [FromQuery] double? minLat,
        [FromQuery] double? maxLat,
        [FromQuery] double? minLng,
        [FromQuery] double? maxLng,
        [FromQuery] ProjectType? type,
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
        if (errors.Count > 0)
            return BadRequest(new ApiErrorResponse("Khung bản đồ không hợp lệ", errors));

        var pins = MockProjectData.Projects
            .Select(p => new PinDto(p.Id, p.Title, p.Latitude, p.Longitude, p.Type, p.ThumbnailUrl))
            .Take(MaxPins)
            .ToList();

        return Ok(pins);
    }
}