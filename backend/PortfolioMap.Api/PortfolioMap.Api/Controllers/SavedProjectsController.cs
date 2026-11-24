using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using PortfolioMap.Api.Dtos.Company;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Mock;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Authorize(Roles = "Company")]
[Route("api/saved-projects")]
public class SavedProjectsController : ControllerBase
{
    [HttpPost("{projectId:int}")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public IActionResult SaveProject(int projectId)
    {
        var project = MockProjectData.Projects.FirstOrDefault(p => p.Id == projectId);
        if (project is null)
        {
            return NotFound(new ApiErrorResponse(
                "Không tìm thấy dự án",
                new() { ["projectId"] = new[] { "Dự án không tồn tại" } }));
        }

        if (MockCompanyData.SavedProjects.Any(p => p.Project.Id == projectId))
        {
            return Conflict(new ApiErrorResponse(
                "Dự án này đã được lưu từ trước.",
                new() { ["projectId"] = new[] { "Dự án này đã được lưu từ trước" } }));
        }

        var savedAt = DateTime.UtcNow;
        MockCompanyData.SavedProjects.Add(new SavedProjectDto(MockProjectData.ToSummary(project), savedAt));
        return StatusCode(StatusCodes.Status201Created, new { projectId, savedAt });
    }

    [HttpDelete("{projectId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult UnsaveProject(int projectId)
    {
        var projectToRemove = MockCompanyData.SavedProjects.FirstOrDefault(p => p.Project.Id == projectId);
        if (projectToRemove is null)
        {
            return NotFound(new ApiErrorResponse(
                "Dự án chưa được lưu",
                new() { ["projectId"] = new[] { "Dự án chưa được lưu" } }));
        }

        MockCompanyData.SavedProjects.Remove(projectToRemove);
        return NoContent();
    }

    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SavedProjectDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public ActionResult<PagedResult<SavedProjectDto>> GetSavedProjects([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var all = MockCompanyData.SavedProjects;
        var items = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        return Ok(new PagedResult<SavedProjectDto>(items, page, pageSize, all.Count));
    }
}