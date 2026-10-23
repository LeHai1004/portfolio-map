namespace PortfolioMap.Api.Dtos.Common;

/// <summary>Kết quả phân trang dùng chung cả nhóm: items, page, pageSize, totalItems.</summary>
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalItems);
