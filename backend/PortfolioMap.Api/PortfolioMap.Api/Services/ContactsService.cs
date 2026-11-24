using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Contacts;
using PortfolioMap.Api.Models;

namespace PortfolioMap.Api.Services;

public sealed class ContactsService : IContactsService
{
    private readonly AppDbContext _db;

    public ContactsService(AppDbContext db) => _db = db;

    public async Task<ContactResult> CreateAsync(
        string fromUserId,
        CreateContactRequest request,
        CancellationToken ct = default)
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

        if (request.ProjectId is not int)
            errors["projectId"] = new[] { "ProjectId là bắt buộc" };

        if (errors.Count > 0)
            return ContactResult.Invalid(
                new ApiErrorResponse("Dữ liệu đầu vào không hợp lệ", errors));

        var projectId = request.ProjectId!.Value;

        var project = await _db.Projects
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.Id == projectId, ct);

        if (project is null ||
            string.Equals(project.Status, "Hidden", StringComparison.OrdinalIgnoreCase))
        {
            return ContactResult.NotFound(
                new ApiErrorResponse(
                    "Không tìm thấy dự án",
                    new Dictionary<string, string[]>
                    {
                        ["projectId"] = new[] { "Dự án không tồn tại" }
                    }));
        }

        var createdAt = DateTime.UtcNow;
        var message = new ContactMessage
        {
            FromUserId = fromUserId,
            ToUserId = project.OwnerId,
            ProjectId = project.Id,
            Subject = subject,
            Content = content,
            IsRead = false,
            CreatedAt = createdAt
        };

        _db.ContactMessages.Add(message);
        await _db.SaveChangesAsync(ct);
        return ContactResult.Ok(message.Id, createdAt);
    }

    public async Task<PagedResult<ContactDto>> GetInboxAsync(
        string toUserId,
        int page,
        int pageSize,
        CancellationToken ct = default) =>
        await GetPagedAsync(
            message => message.ToUserId == toUserId,
            page,
            pageSize,
            ct);

    public async Task<PagedResult<ContactDto>> GetSentAsync(
        string fromUserId,
        int page,
        int pageSize,
        CancellationToken ct = default) =>
        await GetPagedAsync(
            message => message.FromUserId == fromUserId,
            page,
            pageSize,
            ct);

    public async Task<ContactResult> MarkAsReadAsync(
        int id,
        string currentUserId,
        CancellationToken ct = default)
    {
        var message = await _db.ContactMessages
            .FirstOrDefaultAsync(item => item.Id == id, ct);

        if (message is null)
        {
            return ContactResult.NotFound(
                new ApiErrorResponse(
                    "Không tìm thấy liên hệ",
                    new Dictionary<string, string[]>
                    {
                        ["id"] = new[] { "Liên hệ không tồn tại" }
                    }));
        }

        if (message.ToUserId != currentUserId)
        {
            return ContactResult.Forbidden(
                new ApiErrorResponse(
                    "Bạn không phải người nhận liên hệ này",
                    new Dictionary<string, string[]>
                    {
                        ["id"] = new[] { "Chỉ người nhận mới có thể đánh dấu đã đọc" }
                    }));
        }

        message.IsRead = true;
        await _db.SaveChangesAsync(ct);
        return ContactResult.Ok(message.Id, message.CreatedAt);
    }

    private async Task<PagedResult<ContactDto>> GetPagedAsync(
        System.Linq.Expressions.Expression<Func<ContactMessage, bool>> predicate,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = _db.ContactMessages
            .AsNoTracking()
            .Where(predicate);

        var totalItems = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(message => message.CreatedAt)
            .ThenByDescending(message => message.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(message => new ContactDto
            {
                Id = message.Id,
                FromUserId = message.FromUserId,
                FromName = _db.CompanyProfiles
                    .AsNoTracking()
                    .Where(profile => profile.UserId == message.FromUserId)
                    .Select(profile => profile.CompanyName)
                    .FirstOrDefault()
                    ?? (message.FromUser == null
                        ? string.Empty
                        : message.FromUser.FullName),
                ToUserId = message.ToUserId,
                ToName = message.ToUser == null
                    ? string.Empty
                    : message.ToUser.FullName,
                ProjectId = message.Project == null ? null : message.ProjectId,
                ProjectTitle = message.Project == null ? null : message.Project.Title,
                Subject = message.Subject,
                Content = message.Content,
                IsRead = message.IsRead,
                CreatedAt = message.CreatedAt
            })
            .ToListAsync(ct);

        return new PagedResult<ContactDto>(
            items,
            page,
            pageSize,
            totalItems);
    }
}
