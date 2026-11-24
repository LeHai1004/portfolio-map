using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Interaction;
using PortfolioMap.Api.Services;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class InteractionController : ControllerBase
{
    private readonly IInteractionService _interaction;

    public InteractionController(IInteractionService interaction) =>
        _interaction = interaction;

    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);
    private bool IsAdmin => User.IsInRole("Admin");

    [HttpPost("projects/{id:int}/like")]
    [Authorize]
    [ProducesResponseType(typeof(LikeStatusDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public async Task<ActionResult<LikeStatusDto>> AddLike(int id, CancellationToken ct)
    {
        if (CurrentUserId is not { } userId)
            return Unauthorized(new ApiErrorResponse("Chưa đăng nhập hoặc token sai"));

        return Respond(await _interaction.AddLikeAsync(id, userId, IsAdmin, ct));
    }

    [HttpDelete("projects/{id:int}/like")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<bool>> RemoveLike(int id, CancellationToken ct)
    {
        if (CurrentUserId is not { } userId)
            return Unauthorized(new ApiErrorResponse("Chưa đăng nhập hoặc token sai"));

        return Respond(await _interaction.RemoveLikeAsync(id, userId, IsAdmin, ct));
    }

    [HttpGet("projects/{id:int}/like")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LikeStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<LikeStatusDto>> GetLikeStatus(int id, CancellationToken ct) =>
        Respond(await _interaction.GetLikeStatusAsync(id, CurrentUserId, IsAdmin, ct));

    [HttpGet("projects/{id:int}/comments")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<CommentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<PagedResult<CommentDto>>> GetComments(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken ct = default) =>
        Respond(await _interaction.GetCommentsAsync(
            id, CurrentUserId, IsAdmin, page, pageSize, ct));

    [HttpPost("projects/{id:int}/comments")]
    [Authorize]
    [ProducesResponseType(typeof(CommentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CommentDto>> CreateComment(
        int id,
        [FromBody] CreateCommentRequest request,
        CancellationToken ct)
    {
        if (CurrentUserId is not { } userId)
            return Unauthorized(new ApiErrorResponse("Chưa đăng nhập hoặc token sai"));

        return Respond(await _interaction.CreateCommentAsync(
            id, userId, IsAdmin, request, ct));
    }

    [HttpDelete("comments/{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<bool>> DeleteComment(int id, CancellationToken ct)
    {
        if (CurrentUserId is not { } userId)
            return Unauthorized(new ApiErrorResponse("Chưa đăng nhập hoặc token sai"));

        return Respond(await _interaction.DeleteCommentAsync(id, userId, ct));
    }

    private ActionResult<T> Respond<T>(InteractionResult<T> result) => result.Status switch
    {
        InteractionResultStatus.Ok => Ok(result.Value),
        InteractionResultStatus.Created => StatusCode(StatusCodes.Status201Created, result.Value),
        InteractionResultStatus.NoContent => NoContent(),
        InteractionResultStatus.BadRequest => BadRequest(result.Error),
        InteractionResultStatus.NotFound => NotFound(result.Error),
        InteractionResultStatus.Conflict => Conflict(result.Error),
        InteractionResultStatus.Forbidden => StatusCode(StatusCodes.Status403Forbidden, result.Error),
        _ => throw new InvalidOperationException($"Trạng thái interaction không được hỗ trợ: {result.Status}")
    };
}
