using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Contacts;
using PortfolioMap.Api.Mock;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api/contacts")]
public class ContactsController : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = "Company")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult CreateContact([FromBody] CreateContactRequest request)
    {
        var subject = request.Subject?.Trim() ?? string.Empty;
        var content = request.Content?.Trim() ?? string.Empty;
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(subject))
            errors["subject"] = new[] { "Subject không được để trống" };
        else if (subject.Length > 200)
            errors["subject"] = new[] { "Subject tối đa 200 ký tự" };

        if (string.IsNullOrWhiteSpace(content))
            errors["content"] = new[] { "Content không được để trống" };
        else if (content.Length > 2000)
            errors["content"] = new[] { "Content tối đa 2000 ký tự" };

        if (errors.Count > 0)
            return BadRequest(new ApiErrorResponse("Dữ liệu đầu vào không hợp lệ", errors));

        if (request.ProjectId is not int projectId)
        {
            return BadRequest(new ApiErrorResponse(
                "Dữ liệu đầu vào không hợp lệ",
                new() { ["projectId"] = new[] { "ProjectId là bắt buộc" } }));
        }

        var project = MockProjectData.Projects.FirstOrDefault(p => p.Id == projectId);
        if (project is null)
        {
            return NotFound(new ApiErrorResponse(
                "Không tìm thấy dự án",
                new() { ["projectId"] = new[] { "Dự án không tồn tại" } }));
        }

        var createdAt = DateTime.UtcNow;
        var id = MockCompanyData.NextContactId();
        MockCompanyData.Contacts.Add(new ContactDto
        {
            Id = id,
            FromUserId = MockCompanyData.CurrentCompanyId,
            FromName = MockCompanyData.CurrentCompanyName,
            ToUserId = project.Owner.Id,
            ToName = project.Owner.FullName,
            ProjectId = project.Id,
            ProjectTitle = project.Title,
            Subject = subject,
            Content = content,
            IsRead = false,
            CreatedAt = createdAt
        });

        return StatusCode(StatusCodes.Status201Created, new { id, createdAt });
    }

    [HttpGet("inbox")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(PagedResult<ContactDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public ActionResult<PagedResult<ContactDto>> GetInbox()
    {
        var items = MockCompanyData.Contacts
            .Where(contact => contact.ToUserId == MockProjectData.CurrentUserId)
            .ToList();
        return Ok(new PagedResult<ContactDto>(items, 1, 10, items.Count));
    }

    [HttpGet("sent")]
    [Authorize(Roles = "Company")]
    [ProducesResponseType(typeof(PagedResult<ContactDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public ActionResult<PagedResult<ContactDto>> GetSentContacts()
    {
        var items = MockCompanyData.Contacts
            .Where(contact => contact.FromUserId == MockCompanyData.CurrentCompanyId)
            .ToList();
        return Ok(new PagedResult<ContactDto>(items, 1, 10, items.Count));
    }

    [HttpPut("{id:int}/read")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult MarkAsRead(int id)
    {
        var contact = MockCompanyData.Contacts.FirstOrDefault(item => item.Id == id);
        if (contact is null)
        {
            return NotFound(new ApiErrorResponse(
                "Không tìm thấy liên hệ",
                new() { ["id"] = new[] { "Liên hệ không tồn tại" } }));
        }

        if (contact.ToUserId != MockProjectData.CurrentUserId)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiErrorResponse(
                "Bạn không phải người nhận liên hệ này",
                new() { ["id"] = new[] { "Chỉ người nhận mới có thể đánh dấu đã đọc" } }));
        }

        contact.IsRead = true;
        return NoContent();
    }
}