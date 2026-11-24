using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Contacts;
using PortfolioMap.Api.Services;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api/contacts")]
public class ContactsController : ControllerBase
{
    private readonly IContactsService _contacts;

    public ContactsController(IContactsService contacts) => _contacts = contacts;

    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost]
    [Authorize(Roles = "Company")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateContact(
        [FromBody] CreateContactRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized(new ApiErrorResponse(
                "Chưa đăng nhập hoặc token sai"));
        }

        var result = await _contacts.CreateAsync(CurrentUserId, request, ct);
        if (result.IsOk)
        {
            return StatusCode(StatusCodes.Status201Created,
                new { id = result.Id, createdAt = result.CreatedAt });
        }

        return result.Status switch
        {
            ContactResultStatus.Invalid => BadRequest(result.Error),
            ContactResultStatus.NotFound => NotFound(result.Error),
            _ => StatusCode(StatusCodes.Status500InternalServerError, result.Error)
        };
    }

    [HttpGet("inbox")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(typeof(PagedResult<ContactDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<ContactDto>>> GetInbox(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized(new ApiErrorResponse(
                "Chưa đăng nhập hoặc token sai"));
        }

        var result = await _contacts.GetInboxAsync(
            CurrentUserId,
            page,
            pageSize,
            ct);
        return Ok(result);
    }

    [HttpGet("sent")]
    [Authorize(Roles = "Company")]
    [ProducesResponseType(typeof(PagedResult<ContactDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<ContactDto>>> GetSentContacts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized(new ApiErrorResponse(
                "Chưa đăng nhập hoặc token sai"));
        }

        var result = await _contacts.GetSentAsync(
            CurrentUserId,
            page,
            pageSize,
            ct);
        return Ok(result);
    }

    [HttpPut("{id:int}/read")]
    [Authorize(Roles = "Student")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(CurrentUserId))
        {
            return Unauthorized(new ApiErrorResponse(
                "Chưa đăng nhập hoặc token sai"));
        }

        var result = await _contacts.MarkAsReadAsync(id, CurrentUserId, ct);
        if (result.IsOk) return NoContent();

        return result.Status switch
        {
            ContactResultStatus.NotFound => NotFound(result.Error),
            ContactResultStatus.Forbidden =>
                StatusCode(StatusCodes.Status403Forbidden, result.Error),
            _ => StatusCode(StatusCodes.Status500InternalServerError, result.Error)
        };
    }
}