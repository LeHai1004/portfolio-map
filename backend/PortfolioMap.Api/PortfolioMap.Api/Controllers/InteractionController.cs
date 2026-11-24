using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Interaction;
using PortfolioMap.Api.Mock;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api")]
public class InteractionController : ControllerBase
{
    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpPost("projects/{id:int}/like")]
    [Authorize]
    [ProducesResponseType(typeof(LikeStatusDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status409Conflict)]
    public ActionResult<LikeStatusDto> LikeProject(int id)
    {
        if (CurrentUserId is not { } userId)
            return Unauthorized(new ApiErrorResponse("Chưa đăng nhập hoặc token sai"));

        if (!MockInteractionData.ProjectExists(id))
            return NotFound(ProjectError("Dự án không tồn tại"));

        if (!MockInteractionData.TryAddLike(userId, id, out var status))
        {
            return Conflict(new ApiErrorResponse(
                "Bạn đã thích dự án này",
                new Dictionary<string, string[]>
                {
                    ["projectId"] = new[] { "Dự án đã được thích" }
                }));
        }

        return StatusCode(StatusCodes.Status201Created, status);
    }

    [HttpDelete("projects/{id:int}/like")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult UnlikeProject(int id)
    {
        if (CurrentUserId is not { } userId)
            return Unauthorized(new ApiErrorResponse("Chưa đăng nhập hoặc token sai"));

        if (!MockInteractionData.ProjectExists(id) ||
            !MockInteractionData.TryRemoveLike(userId, id))
        {
            return NotFound(new ApiErrorResponse(
                "Không tìm thấy lượt thích hoặc dự án",
                new Dictionary<string, string[]>
                {
                    ["projectId"] = new[] { "Dự án không tồn tại hoặc chưa được thích" }
                }));
        }

        return NoContent();
    }

    [HttpGet("projects/{id:int}/like")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(LikeStatusDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public ActionResult<LikeStatusDto> GetLikeStatus(int id)
    {
        if (!MockInteractionData.ProjectExists(id))
            return NotFound(ProjectError("Dự án không tồn tại"));

        return Ok(MockInteractionData.GetLikeStatus(id, CurrentUserId));
    }

    [HttpGet("projects/{id:int}/comments")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PagedResult<CommentDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public ActionResult<PagedResult<CommentDto>> GetComments(
        int id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (!MockInteractionData.ProjectExists(id))
            return NotFound(ProjectError("Dự án không tồn tại"));

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var items = MockInteractionData.GetComments(id, page, pageSize, out var totalItems);
        return Ok(new PagedResult<CommentDto>(items, page, pageSize, totalItems));
    }

    [HttpPost("projects/{id:int}/comments")]
    [Authorize]
    [ProducesResponseType(typeof(CommentDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public ActionResult<CommentDto> CreateComment(
        int id,
        [FromBody] CreateCommentRequest request)
    {
        var content = request?.Content?.Trim() ?? string.Empty;
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(content))
            errors["content"] = new[] { "Content không được để trống" };
        else if (content.Length > 1000)
            errors["content"] = new[] { "Content tối đa 1000 ký tự" };

        if (errors.Count > 0)
        {
            return BadRequest(new ApiErrorResponse(
                "Dữ liệu đầu vào không hợp lệ",
                errors));
        }

        if (CurrentUserId is not { } userId)
            return Unauthorized(new ApiErrorResponse("Chưa đăng nhập hoặc token sai"));

        if (!MockInteractionData.ProjectExists(id))
            return NotFound(ProjectError("Dự án không tồn tại"));

        var email = User.FindFirstValue(ClaimTypes.Email);
        var comment = MockInteractionData.AddComment(id, content, userId, email);
        return StatusCode(StatusCodes.Status201Created, comment);
    }

    [HttpDelete("comments/{id:int}")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public IActionResult DeleteComment(int id)
    {
        if (CurrentUserId is not { } userId)
            return Unauthorized(new ApiErrorResponse("Chưa đăng nhập hoặc token sai"));

        var comment = MockInteractionData.GetComment(id);
        if (comment is null)
        {
            return NotFound(new ApiErrorResponse(
                "Không tìm thấy bình luận",
                new Dictionary<string, string[]>
                {
                    ["id"] = new[] { "Bình luận không tồn tại" }
                }));
        }

        if (!string.Equals(comment.Author.Id, userId, StringComparison.Ordinal))
        {
            return StatusCode(StatusCodes.Status403Forbidden, new ApiErrorResponse(
                "Bạn không có quyền xóa bình luận này",
                new Dictionary<string, string[]>
                {
                    ["id"] = new[] { "Chỉ tác giả mới được xóa bình luận" }
                }));
        }

        MockInteractionData.RemoveComment(id);
        return NoContent();
    }

    private static ApiErrorResponse ProjectError(string message) =>
        new(
            message,
            new Dictionary<string, string[]>
            {
                ["projectId"] = new[] { "Dự án không tồn tại" }
            });
}
