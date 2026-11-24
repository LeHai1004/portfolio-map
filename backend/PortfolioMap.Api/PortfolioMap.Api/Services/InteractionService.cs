using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Interaction;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Models;

namespace PortfolioMap.Api.Services;

public sealed class InteractionService : IInteractionService
{
    private readonly AppDbContext _db;

    public InteractionService(AppDbContext db) => _db = db;

    public async Task<InteractionResult<LikeStatusDto>> AddLikeAsync(
        int projectId,
        string userId,
        CancellationToken ct = default)
    {
        if (!await CanAccessProjectAsync(projectId, userId, ct))
            return NotFound<LikeStatusDto>("Không tìm thấy dự án", "projectId");

        var existing = await _db.Likes
            .AsNoTracking()
            .AnyAsync(like => like.UserId == userId && like.ProjectId == projectId, ct);
        if (existing)
            return Conflict<LikeStatusDto>("Bạn đã thích dự án này", "projectId");

        var like = new Like
        {
            UserId = userId,
            ProjectId = projectId,
            CreatedAt = DateTime.UtcNow
        };
        _db.Likes.Add(like);

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex)
        {
            _db.Entry(like).State = EntityState.Detached;
            if (IsUniqueConstraintViolation(ex))
                return Conflict<LikeStatusDto>("Bạn đã thích dự án này", "projectId");

            throw;
        }

        var count = await _db.Likes.CountAsync(item => item.ProjectId == projectId, ct);
        return new InteractionResult<LikeStatusDto>(
            InteractionResultStatus.Created,
            new LikeStatusDto(count, LikedByMe: true));
    }

    public async Task<InteractionResult<bool>> RemoveLikeAsync(
        int projectId,
        string userId,
        CancellationToken ct = default)
    {
        if (!await CanAccessProjectAsync(projectId, userId, ct))
            return NotFound<bool>("Không tìm thấy dự án", "projectId");

        var like = await _db.Likes.FirstOrDefaultAsync(
            item => item.UserId == userId && item.ProjectId == projectId,
            ct);
        if (like is null)
            return NotFound<bool>("Bạn chưa thích dự án này", "projectId");

        _db.Likes.Remove(like);
        await _db.SaveChangesAsync(ct);
        return new InteractionResult<bool>(InteractionResultStatus.NoContent);
    }

    public async Task<InteractionResult<LikeStatusDto>> GetLikeStatusAsync(
        int projectId,
        string? userId,
        CancellationToken ct = default)
    {
        if (!await CanAccessProjectAsync(projectId, userId, ct))
            return NotFound<LikeStatusDto>("Không tìm thấy dự án", "projectId");

        var count = await _db.Likes.CountAsync(item => item.ProjectId == projectId, ct);
        var likedByMe = userId is not null &&
            await _db.Likes.AnyAsync(
                item => item.UserId == userId && item.ProjectId == projectId,
                ct);

        return new InteractionResult<LikeStatusDto>(
            InteractionResultStatus.Ok,
            new LikeStatusDto(count, likedByMe));
    }

    public async Task<InteractionResult<PagedResult<CommentDto>>> GetCommentsAsync(
        int projectId,
        string? userId,
        int page,
        int pageSize,
        CancellationToken ct = default)
    {
        if (!await CanAccessProjectAsync(projectId, userId, ct))
            return NotFound<PagedResult<CommentDto>>("Không tìm thấy dự án", "projectId");

        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.Comments
            .AsNoTracking()
            .Where(comment => comment.ProjectId == projectId);
        var totalItems = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(comment => comment.CreatedAt)
            .ThenByDescending(comment => comment.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(comment => new CommentDto(
                comment.Id,
                comment.Content,
                comment.CreatedAt,
                new OwnerDto(
                    comment.User!.Id,
                    comment.User.FullName,
                    comment.User.AvatarUrl)))
            .ToListAsync(ct);

        return new InteractionResult<PagedResult<CommentDto>>(
            InteractionResultStatus.Ok,
            new PagedResult<CommentDto>(items, page, pageSize, totalItems));
    }

    public async Task<InteractionResult<CommentDto>> CreateCommentAsync(
        int projectId,
        string userId,
        CreateCommentRequest request,
        CancellationToken ct = default)
    {
        var content = request.Content?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(content))
            return BadRequest<CommentDto>("Nội dung bình luận là bắt buộc", "content");
        if (content.Length > 1000)
            return BadRequest<CommentDto>("Nội dung bình luận tối đa 1000 ký tự", "content");

        if (!await CanAccessProjectAsync(projectId, userId, ct))
            return NotFound<CommentDto>("Không tìm thấy dự án", "projectId");

        var comment = new Comment
        {
            ProjectId = projectId,
            UserId = userId,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };
        _db.Comments.Add(comment);
        await _db.SaveChangesAsync(ct);

        var dto = await _db.Comments
            .AsNoTracking()
            .Where(item => item.Id == comment.Id)
            .Select(item => new CommentDto(
                item.Id,
                item.Content,
                item.CreatedAt,
                new OwnerDto(
                    item.User!.Id,
                    item.User.FullName,
                    item.User.AvatarUrl)))
            .SingleAsync(ct);

        return new InteractionResult<CommentDto>(InteractionResultStatus.Created, dto);
    }

    public async Task<InteractionResult<bool>> DeleteCommentAsync(
        int commentId,
        string userId,
        CancellationToken ct = default)
    {
        var comment = await _db.Comments
            .FirstOrDefaultAsync(item => item.Id == commentId, ct);
        if (comment is null)
            return NotFound<bool>("Không tìm thấy bình luận", "id");
        if (comment.UserId != userId)
            return Forbidden<bool>("Bạn không có quyền xóa bình luận này", "id");

        _db.Comments.Remove(comment);
        await _db.SaveChangesAsync(ct);
        return new InteractionResult<bool>(InteractionResultStatus.NoContent);
    }

    private async Task<bool> CanAccessProjectAsync(
        int projectId,
        string? userId,
        CancellationToken ct)
    {
        var project = await _db.Projects
            .AsNoTracking()
            .Where(item => item.Id == projectId)
            .Select(item => new { item.Status, item.OwnerId })
            .FirstOrDefaultAsync(ct);

        return project is not null &&
            (!string.Equals(project.Status, "Hidden", StringComparison.OrdinalIgnoreCase) ||
             project.OwnerId == userId);
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException exception)
    {
        for (var inner = exception.InnerException; inner is not null; inner = inner.InnerException)
        {
            if (inner is SqlException sqlException &&
                sqlException.Errors.Cast<SqlError>().Any(error => error.Number is 2601 or 2627))
            {
                return true;
            }
        }

        return false;
    }

    private static InteractionResult<T> BadRequest<T>(string message, string field) =>
        new(
            InteractionResultStatus.BadRequest,
            Error: new ApiErrorResponse(
                "Dữ liệu đầu vào không hợp lệ",
                new Dictionary<string, string[]> { [field] = new[] { message } }));

    private static InteractionResult<T> NotFound<T>(string message, string field) =>
        new(
            InteractionResultStatus.NotFound,
            Error: new ApiErrorResponse(
                message,
                new Dictionary<string, string[]> { [field] = new[] { message } }));

    private static InteractionResult<T> Conflict<T>(string message, string field) =>
        new(
            InteractionResultStatus.Conflict,
            Error: new ApiErrorResponse(
                message,
                new Dictionary<string, string[]> { [field] = new[] { message } }));

    private static InteractionResult<T> Forbidden<T>(string message, string field) =>
        new(
            InteractionResultStatus.Forbidden,
            Error: new ApiErrorResponse(
                message,
                new Dictionary<string, string[]> { [field] = new[] { message } }));
}
