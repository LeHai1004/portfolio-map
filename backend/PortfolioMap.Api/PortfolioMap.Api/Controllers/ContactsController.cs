using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using PortfolioMap.Api.Dtos.Contacts;
using PortfolioMap.Api.Dtos.Common;

namespace PortfolioMap.Api.Controllers
{
    [Route("api/contacts")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        [HttpPost]
        public IActionResult CreateContact([FromBody] CreateContactRequest request)
        {
            return StatusCode(201, new { id = 1, createdAt = DateTime.UtcNow });
        }

        [HttpGet("inbox")]
        public ActionResult<PagedResult<ContactDto>> GetInbox()
        {
            var items = new List<ContactDto>
            {
                new ContactDto
                {
                    Id = 1,
                    FromUserId = "company-1",
                    FromName = "Công ty TNHH ABC",
                    ToUserId = "student-1",
                    ToName = "Sinh viên mẫu",
                    ProjectId = 10,
                    ProjectTitle = "App Quản lý",
                    Subject = "Mời phỏng vấn",
                    Content = "Chúng tôi rất ấn tượng với dự án của bạn.",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                }
            };

            // Truyền vào ngoặc tròn ()
            var mockData = new PagedResult<ContactDto>(items, 1, 10, 1);
            return Ok(mockData);
        }

        [HttpGet("sent")]
        public ActionResult<PagedResult<ContactDto>> GetSentContacts()
        {
            var items = new List<ContactDto>
            {
                new ContactDto
                {
                    Id = 2,
                    FromUserId = "company-1",
                    FromName = "Công ty TNHH ABC",
                    ToUserId = "student-2",
                    ToName = "Nguyễn Văn A",
                    ProjectId = 12,
                    ProjectTitle = "Website bán hàng",
                    Subject = "Liên hệ",
                    Content = "Test lời nhắn gửi đi.",
                    IsRead = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-2)
                }
            };

            // Truyền vào ngoặc tròn ()
            var mockData = new PagedResult<ContactDto>(items, 1, 10, 1);
            return Ok(mockData);
        }

        [HttpPut("{id:int}/read")]
        public IActionResult MarkAsRead(int id)
        {
            return NoContent();
        }
    }
}