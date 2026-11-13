using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Collections.Generic;
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
        [ProducesResponseType(typeof(SavedProjectDto), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
        public IActionResult SaveProject(int projectId)
        {
            if (MockCompanyData.SavedProjects.Any(p => p.Id == projectId))
            {
                return Conflict(new ApiErrorResponse("Dự án này đã được lưu từ trước."));
            }

            var newSavedProject = new SavedProjectDto
            {
                Id = projectId,
                Title = $"Dự án {projectId}",
                SavedAt = DateTime.UtcNow
            };

            MockCompanyData.SavedProjects.Add(newSavedProject);
            return StatusCode(201, newSavedProject);
        }

        [HttpDelete("{projectId:int}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public IActionResult UnsaveProject(int projectId)
        {
            var projectToRemove = MockCompanyData.SavedProjects.FirstOrDefault(p => p.Id == projectId);
            if (projectToRemove != null)
            {
                MockCompanyData.SavedProjects.Remove(projectToRemove);
            }
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