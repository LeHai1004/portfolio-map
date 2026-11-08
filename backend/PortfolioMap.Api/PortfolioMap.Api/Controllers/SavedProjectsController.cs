using Microsoft.AspNetCore.Mvc;
using System;
using PortfolioMap.Api.Dtos.Company;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Mock;
using Microsoft.AspNetCore.Http;

namespace PortfolioMap.Api.Controllers
{
    // TODO: [Authorize(Roles = "Company")]
    [Route("api/saved-projects")]
    [ApiController]
    public class SavedProjectsController : ControllerBase
    {
        [HttpPost("{projectId:int}")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public IActionResult SaveProject(int projectId)
        {
            if (MockCompanyData.SavedProjectIds.Contains(projectId))
            {
                return Conflict(new { message = "Dự án này đã được lưu từ trước." });
            }

            MockCompanyData.SavedProjectIds.Add(projectId);
            return StatusCode(201, new { projectId = projectId, savedAt = DateTime.UtcNow });
        }

        [HttpDelete("{projectId:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public IActionResult UnsaveProject(int projectId)
        {
            MockCompanyData.SavedProjectIds.Remove(projectId);
            return NoContent();
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult<PagedResult<SavedProjectDto>> GetSavedProjects()
        {
            var items = MockCompanyData.SavedProjects;
            var mockData = new PagedResult<SavedProjectDto>(items, 1, 10, items.Count);
            
            return Ok(mockData);
        }
    }
}