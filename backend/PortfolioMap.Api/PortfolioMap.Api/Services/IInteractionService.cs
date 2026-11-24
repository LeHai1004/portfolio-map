using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Interaction;

namespace PortfolioMap.Api.Services;

public enum InteractionResultStatus
{
    Ok,
    Created,
    NoContent,
    BadRequest,
    NotFound,
    Conflict,
    Forbidden
}

public sealed record InteractionResult<T>(
    InteractionResultStatus Status,
    T? Value = default,
    ApiErrorResponse? Error = null);

public interface IInteractionService
{
    Task<InteractionResult<LikeStatusDto>> AddLikeAsync(
        int projectId,
        string userId,
        CancellationToken ct = default);

    Task<InteractionResult<bool>> RemoveLikeAsync(
        int projectId,
        string userId,
        CancellationToken ct = default);

    Task<InteractionResult<LikeStatusDto>> GetLikeStatusAsync(
        int projectId,
        string? userId,
        CancellationToken ct = default);

    Task<InteractionResult<PagedResult<CommentDto>>> GetCommentsAsync(
        int projectId,
        string? userId,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<InteractionResult<CommentDto>> CreateCommentAsync(
        int projectId,
        string userId,
        CreateCommentRequest request,
        CancellationToken ct = default);

    Task<InteractionResult<bool>> DeleteCommentAsync(
        int commentId,
        string userId,
        CancellationToken ct = default);
}
