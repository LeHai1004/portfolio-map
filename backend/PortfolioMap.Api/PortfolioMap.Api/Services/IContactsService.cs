using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Contacts;

namespace PortfolioMap.Api.Services;

public enum ContactResultStatus
{
    Ok,
    Invalid,
    NotFound,
    Forbidden
}

public record ContactResult(
    ContactResultStatus Status,
    int? Id = null,
    DateTime? CreatedAt = null,
    ApiErrorResponse? Error = null)
{
    public bool IsOk => Status == ContactResultStatus.Ok;

    public static ContactResult Ok(int id, DateTime createdAt) =>
        new(ContactResultStatus.Ok, id, createdAt);

    public static ContactResult Invalid(ApiErrorResponse error) =>
        new(ContactResultStatus.Invalid, Error: error);

    public static ContactResult NotFound(ApiErrorResponse error) =>
        new(ContactResultStatus.NotFound, Error: error);

    public static ContactResult Forbidden(ApiErrorResponse error) =>
        new(ContactResultStatus.Forbidden, Error: error);
}

public interface IContactsService
{
    Task<ContactResult> CreateAsync(
        string fromUserId,
        CreateContactRequest request,
        CancellationToken ct = default);

    Task<PagedResult<ContactDto>> GetInboxAsync(
        string toUserId,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<PagedResult<ContactDto>> GetSentAsync(
        string fromUserId,
        int page,
        int pageSize,
        CancellationToken ct = default);

    Task<ContactResult> MarkAsReadAsync(
        int id,
        string currentUserId,
        CancellationToken ct = default);
}
