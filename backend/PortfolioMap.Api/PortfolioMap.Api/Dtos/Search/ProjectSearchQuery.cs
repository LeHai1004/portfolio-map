namespace PortfolioMap.Api.Dtos.Search;

/// <summary>Tham số GET /api/projects. Tất cả đều tùy chọn.</summary>
public class ProjectSearchQuery
{
    public string? Keyword { get; set; }
    public int? Tag { get; set; }
    /// <summary>Web, Mobile, Game, AI, Other. Để kiểu string để trả đúng câu lỗi của hợp đồng.</summary>
    public string? Type { get; set; }
    public int? UniversityId { get; set; }
    /// <summary>"newest" (mặc định) hoặc "views".</summary>
    public string? Sort { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}