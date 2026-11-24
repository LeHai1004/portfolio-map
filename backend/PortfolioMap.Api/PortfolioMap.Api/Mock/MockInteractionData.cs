using PortfolioMap.Api.Dtos.Interaction;
using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Mock;

public static class MockInteractionData
{
    private static readonly Lock Gate = new();
    private static readonly HashSet<int> ProjectIds = new() { 1, 2, 3, 4, 5, 6 };
    private static readonly HashSet<(string UserId, int ProjectId)> Likes = new()
    {
        (MockProjectData.OwnerA.Id, 1),
        (MockProjectData.OwnerB.Id, 1),
        (MockProjectData.OwnerA.Id, 2)
    };
    private static readonly Dictionary<string, OwnerDto> Authors = new(StringComparer.Ordinal)
    {
        [MockProjectData.OwnerA.Id] = MockProjectData.OwnerA,
        [MockProjectData.OwnerB.Id] = MockProjectData.OwnerB
    };
    private static readonly List<CommentDto> Comments = new()
    {
        new(
            1,
            1,
            "Dự án rất ấn tượng, phần giao diện dễ theo dõi.",
            DateTime.UtcNow.AddHours(-2),
            MockProjectData.OwnerB),
        new(
            2,
            1,
            "Mình sẽ chia sẻ thêm tài liệu triển khai.",
            DateTime.UtcNow.AddHours(-1),
            MockProjectData.OwnerA)
    };
    private static int _nextCommentId = 2;

    public static bool ProjectExists(int projectId)
    {
        lock (Gate) return ProjectIds.Contains(projectId);
    }

    public static bool LikeExists(string userId, int projectId)
    {
        lock (Gate) return Likes.Contains((userId, projectId));
    }

    public static LikeStatusDto AddLike(string userId, int projectId)
    {
        lock (Gate)
        {
            Likes.Add((userId, projectId));
            return new LikeStatusDto(
                Likes.Count(item => item.ProjectId == projectId),
                true);
        }
    }

    public static LikeStatusDto RemoveLike(string userId, int projectId)
    {
        lock (Gate)
        {
            Likes.Remove((userId, projectId));
            return new LikeStatusDto(
                Likes.Count(item => item.ProjectId == projectId),
                false);
        }
    }

    public static LikeStatusDto GetLikeStatus(int projectId, string? userId)
    {
        lock (Gate)
        {
            return new LikeStatusDto(
                Likes.Count(item => item.ProjectId == projectId),
                userId is not null && Likes.Contains((userId, projectId)));
        }
    }

    public static IReadOnlyList<CommentDto> GetComments(
        int projectId,
        int page,
        int pageSize,
        out int totalItems)
    {
        lock (Gate)
        {
            page = Math.Max(1, page);
            pageSize = Math.Clamp(pageSize, 1, 50);

            var query = Comments
                .Where(comment => comment.ProjectId == projectId)
                .OrderByDescending(comment => comment.CreatedAt)
                .ThenByDescending(comment => comment.Id);
            totalItems = query.Count();
            return query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();
        }
    }

    public static CommentDto AddComment(
        int projectId,
        string content,
        string userId,
        string? email)
    {
        lock (Gate)
        {
            if (!Authors.TryGetValue(userId, out var author))
            {
                var fallbackName = !string.IsNullOrWhiteSpace(email)
                    ? email.Split('@', 2)[0]
                    : $"User {userId}";
                author = new OwnerDto(userId, fallbackName, null);
                Authors[userId] = author;
            }

            var comment = new CommentDto(
                Interlocked.Increment(ref _nextCommentId),
                projectId,
                content,
                DateTime.UtcNow,
                author);
            Comments.Add(comment);
            return comment;
        }
    }

    public static CommentDto? GetComment(int commentId)
    {
        lock (Gate) return Comments.FirstOrDefault(comment => comment.Id == commentId);
    }

    public static bool RemoveComment(int commentId)
    {
        lock (Gate)
        {
            var comment = Comments.FirstOrDefault(item => item.Id == commentId);
            if (comment is null) return false;
            Comments.Remove(comment);
            return true;
        }
    }
}
