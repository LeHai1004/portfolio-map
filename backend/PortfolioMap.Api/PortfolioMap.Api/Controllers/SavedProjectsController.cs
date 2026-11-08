using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using PortfolioMap.Api.Dtos.Company;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Projects; // Thêm dòng này để dùng ProjectType

namespace PortfolioMap.Api.Controllers
{
    [Route("api/saved-projects")]
    [ApiController]
    public class SavedProjectsController : ControllerBase
    {
        [HttpPost("{projectId:int}")]
        public IActionResult SaveProject(int projectId)
        {
            return StatusCode(201, new { projectId = projectId, savedAt = DateTime.UtcNow });
        }

        [HttpDelete("{projectId:int}")]
        public IActionResult UnsaveProject(int projectId)
        {
            return NoContent();
        }

        [HttpGet]
        public ActionResult<PagedResult<SavedProjectDto>> GetSavedProjects()
        {
            // Tạo list dữ liệu mẫu trước
            var items = new List<SavedProjectDto>
            {
                new SavedProjectDto
                {
                    Id = 1,
                    Title = "Dự án mẫu",
                    Type = ProjectType.Web, // Sửa lỗi string thành enum
                    ThumbnailUrl = "/thumb.jpg",
                    Latitude = 16.0738,
                    Longitude = 108.1499,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    SavedAt = DateTime.UtcNow
                }
            };

            // Truyền dữ liệu vào ngoặc tròn () theo đúng ý của Sỹ
            var mockData = new PagedResult<SavedProjectDto>(items, 1, 10, 1);
            
            return Ok(mockData);
        }
    }
}