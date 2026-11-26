using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Dtos.Search;
using PortfolioMap.Api.Mock;
using PortfolioMap.Api.Services;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api/projects")]
public class ProjectSearchController : ControllerBase
{
    private const string InvalidTypeMessage = "Loại dự án không hợp lệ. Chỉ nhận: Web, Mobile, Game, AI, Other";
    private readonly IProjectSearchService _search;

    public ProjectSearchController(IProjectSearchService search) => _search = search;

    /// <summary>Tìm và lọc dự án.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ProjectSummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<PagedResult<ProjectSummaryDto>>> Search(
        [FromQuery] ProjectSearchQuery query,
        CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string[]>();

        ProjectType? type = null;
        if (!string.IsNullOrWhiteSpace(query.Type))
        {
            // Chỉ nhận đúng tên, không nhận số ("1") vì Enum.TryParse sẽ chấp nhận số
            var name = Enum.GetNames<ProjectType>()
                .FirstOrDefault(n => n.Equals(query.Type.Trim(), StringComparison.OrdinalIgnoreCase));
            if (name is null) errors["type"] = new[] { InvalidTypeMessage };
            else type = Enum.Parse<ProjectType>(name);
        }

        var sort = string.IsNullOrWhiteSpace(query.Sort) ? "newest" : query.Sort.Trim().ToLowerInvariant();
        if (sort != "newest" && sort != "views")
            errors["sort"] = new[] { "sort chỉ nhận: newest, views" };

        if (query.Page < 1)
            errors["page"] = new[] { "page phải từ 1 trở lên" };
        if (query.PageSize < 1 || query.PageSize > 50)
            errors["pageSize"] = new[] { "pageSize phải từ 1 đến 50" };

        if (errors.Count > 0) return BadRequest(ErrorBody(errors));

        var results = await _search.SearchAsync(
            query, type, sort == "views", cancellationToken);
        return Ok(results);
    }

    /// <summary>Tìm dự án trong bán kính, gần đến xa, tối đa 100 (dữ liệu mẫu).</summary>
    [HttpGet("nearby")]
    [ProducesResponseType(typeof(IReadOnlyList<NearbyProjectDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public ActionResult<IReadOnlyList<NearbyProjectDto>> Nearby(
        [FromQuery] double? lat, [FromQuery] double? lng, [FromQuery] double radiusKm = 5)
    {
        var errors = new Dictionary<string, string[]>();

        if (lat is null) errors["lat"] = new[] { "Thiếu lat" };
        else if (double.IsNaN(lat.Value) || lat < -90 || lat > 90)
            errors["lat"] = new[] { "lat phải từ -90 đến 90" };

        if (lng is null) errors["lng"] = new[] { "Thiếu lng" };
        else if (double.IsNaN(lng.Value) || lng < -180 || lng > 180)
            errors["lng"] = new[] { "lng phải từ -180 đến 180" };

        if (double.IsNaN(radiusKm) || radiusKm <= 0 || radiusKm > 50)
            errors["radiusKm"] = new[] { "radiusKm phải lớn hơn 0 và tối đa 50" };

        if (errors.Count > 0) return BadRequest(ErrorBody(errors));

        return Ok(MockNearbyData.Nearby(lat!.Value, lng!.Value, radiusKm));
    }

    private static object ErrorBody(Dictionary<string, string[]> errors) => new
    {
        message = errors.Count == 1 ? errors.Values.First()[0] : "Dữ liệu không hợp lệ.",
        errors
    };
}