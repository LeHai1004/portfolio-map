using System.ComponentModel.DataAnnotations;

namespace PortfolioMap.Api.Dtos.Projects;

/// <summary>Body dùng chung cho POST và PUT /api/projects.</summary>
public class ProjectUpsertRequest
{
    [Required(ErrorMessage = "Tên dự án là bắt buộc")]
    [StringLength(200, ErrorMessage = "Tên dự án tối đa 200 ký tự")]
    public string Title { get; set; } = "";

    [StringLength(5000, ErrorMessage = "Mô tả tối đa 5000 ký tự")]
    public string? Description { get; set; }

    [Required(ErrorMessage = "Loại dự án là bắt buộc")]
    public ProjectType? Type { get; set; }

    [Required(ErrorMessage = "Vĩ độ là bắt buộc")]
    [Range(-90, 90, ErrorMessage = "Vĩ độ phải từ -90 đến 90")]
    public double? Latitude { get; set; }

    [Required(ErrorMessage = "Kinh độ là bắt buộc")]
    [Range(-180, 180, ErrorMessage = "Kinh độ phải từ -180 đến 180")]
    public double? Longitude { get; set; }

    [StringLength(300)]
    public string? AddressText { get; set; }

    /// <summary>Có thể để trống (null).</summary>
    public int? UniversityId { get; set; }

    [Url(ErrorMessage = "Link GitHub không hợp lệ")]
    [StringLength(500)]
    public string? GithubUrl { get; set; }

    [Url(ErrorMessage = "Link demo không hợp lệ")]
    [StringLength(500)]
    public string? DemoUrl { get; set; }

    public List<int> TagIds { get; set; } = new();
}