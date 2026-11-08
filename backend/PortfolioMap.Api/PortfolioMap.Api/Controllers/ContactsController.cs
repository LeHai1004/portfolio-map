using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using PortfolioMap.Api.Dtos.Contacts;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Mock;
using Microsoft.AspNetCore.Http;

namespace PortfolioMap.Api.Controllers
{
    // TODO: [Authorize(Roles = "Student, Company")]
    [Route("api/contacts")]
    [ApiController]
    public class ContactsController : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public IActionResult CreateContact([FromBody] CreateContactRequest request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Subject) || request.Subject.Length > 200)
                errors.Add("Subject không được để trống và tối đa 200 ký tự.");
            
            if (string.IsNullOrWhiteSpace(request.Content) || request.Content.Length > 2000)
                errors.Add("Content không được để trống và tối đa 2000 ký tự.");

            if (errors.Count > 0)
            {
                return BadRequest(new { message = "Dữ liệu đầu vào không hợp lệ", errors = errors });
            }

            // Kiểm tra ProjectId có trong MockData không (giả lập 404)
            if (!MockCompanyData.SavedProjectIds.Contains(request.ProjectId))
            {
                return NotFound(new { message = "Không tìm thấy dự án" });
            }

            return StatusCode(201, new 
            { 
                id = new Random().Next(10, 100), 
                projectId = request.ProjectId, 
                subject = request.Subject, 
                content = request.Content, 
                createdAt = DateTime.UtcNow 
            });
        }

        // TODO: [Authorize(Roles = "Student")]
        [HttpGet("inbox")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult<PagedResult<InboxMessageDto>> GetInbox()
        {
            var items = MockCompanyData.InboxMessages;
            var mockData = new PagedResult<InboxMessageDto>(items, 1, 10, items.Count);
            return Ok(mockData);
        }

        // TODO: [Authorize(Roles = "Company")]
        [HttpGet("sent")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult<PagedResult<ContactDto>> GetSentContacts()
        {
            // Trả về mảng rỗng để đúng cấu trúc PagedResult
            var mockData = new PagedResult<ContactDto>(new List<ContactDto>(), 1, 10, 0);
            return Ok(mockData);
        }

        [HttpPut("{id:int}/read")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public IActionResult MarkAsRead(int id)
        {
            return NoContent();
        }
    }
}