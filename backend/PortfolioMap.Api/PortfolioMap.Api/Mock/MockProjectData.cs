using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Mock;

/// <summary>
/// DỮ LIỆU MẪU cho giai đoạn hợp đồng. XÓA file này khi Hải nối DB thật.
/// Quy ước test: người dùng giả là Id=1 (OwnerA). Dự án Id=5 thuộc người khác nên PUT/DELETE trả 403.
/// Tọa độ trường chỉ là gần đúng, Sơn sẽ tra lại trên OpenStreetMap ở thẻ S0-09.
/// </summary>
public static class MockProjectData
{
    public const string CurrentUserId = "1";
    public const int NewProjectId = 100;
    public const int NewImageId = 100;

    public static readonly OwnerDto OwnerA = new("1", "Nguyễn Văn A", "/uploads/avatars/1.jpg");
    public static readonly OwnerDto OwnerB = new("2", "Trần Thị B", null);

    public static readonly IReadOnlyList<UniversityDto> Universities = new List<UniversityDto>
    {
        new(1, "Đại học Bách Khoa - ĐH Đà Nẵng", "54 Nguyễn Lương Bằng, Liên Chiểu", 16.0738, 108.1499),
        new(2, "Đại học Sư phạm - ĐH Đà Nẵng", "459 Tôn Đức Thắng, Liên Chiểu", 16.0613, 108.1578),
        new(3, "Đại học Kinh tế - ĐH Đà Nẵng", "71 Ngũ Hành Sơn, Ngũ Hành Sơn", 16.0472, 108.2406),
        new(4, "Đại học Duy Tân", "254 Nguyễn Văn Linh, Thanh Khê", 16.0600, 108.2100),
        new(5, "Đại học FPT Đà Nẵng", "Khu đô thị FPT, Ngũ Hành Sơn", 15.9689, 108.2605),
    };

    public static readonly IReadOnlyList<TagDto> Tags = new List<TagDto>
    {
        new(1, "React"), new(2, "C#"), new(3, "ASP.NET Core"), new(4, "Unity"), new(5, "Python"),
        new(6, "TypeScript"), new(7, "Flutter"), new(8, "SQL Server"), new(9, "TensorFlow"), new(10, "Node.js"),
    };

    public static readonly List<ProjectDetailDto> Projects = new()
    {
        Make(1, "App quản lý chi tiêu", "Ứng dụng ghi chép thu chi cá nhân, có biểu đồ theo tháng.",
            ProjectType.Mobile, 16.0738, 108.1499, "ĐH Bách Khoa", 1, "https://github.com/example/expense-app", null, new[] { 7, 2 }, OwnerA, 120, 20),
        Make(2, "Website portfolio sinh viên", "Trang giới thiệu dự án cá nhân bằng React.",
            ProjectType.Web, 16.0745, 108.1510, "ĐH Bách Khoa", 1, "https://github.com/example/portfolio", "https://example.com/portfolio", new[] { 1, 6 }, OwnerA, 85, 15),
        Make(3, "Game platformer 2D", "Game đi cảnh làm bằng Unity, 5 màn chơi.",
            ProjectType.Game, 16.0610, 108.1580, "ĐH Sư phạm", 2, null, "https://example.com/game", new[] { 4, 2 }, OwnerA, 60, 10),
        Make(4, "Nhận diện biển số xe", "Đồ án AI nhận diện biển số từ ảnh.",
            ProjectType.AI, 16.0598, 108.2105, "ĐH Duy Tân", 4, "https://github.com/example/alpr", null, new[] { 5, 9 }, OwnerA, 200, 5),
        Make(5, "Hệ thống quản lý thư viện", "Web quản lý mượn trả sách (dự án của người khác, dùng để test 403).",
            ProjectType.Web, 15.9690, 108.2600, "ĐH FPT", 5, "https://github.com/example/library", null, new[] { 3, 8 }, OwnerB, 33, 2),
    };

    public static ProjectSummaryDto ToSummary(ProjectDetailDto p) =>
        new(p.Id, p.Title, p.Type, p.ThumbnailUrl, p.Latitude, p.Longitude, p.CreatedAt);

    /// <summary>Tạo ProjectDetailDto từ request (dùng cho POST và PUT giả).</summary>
    public static ProjectDetailDto FromRequest(int id, ProjectUpsertRequest r, OwnerDto owner, ProjectDetailDto? existing)
    {
        var images = existing?.Images ?? new List<ProjectImageDto>();
        return new ProjectDetailDto(
            id, r.Title, r.Description, r.Type!.Value, r.Latitude!.Value, r.Longitude!.Value, r.AddressText,
            r.UniversityId, Universities.FirstOrDefault(u => u.Id == r.UniversityId)?.Name,
            r.GithubUrl, r.DemoUrl, images.FirstOrDefault()?.ImageUrl,
            images, Tags.Where(t => r.TagIds.Contains(t.Id)).ToList(), owner,
            existing?.ViewCount ?? 0, existing?.CreatedAt ?? DateTime.UtcNow);
    }

    private static ProjectDetailDto Make(int id, string title, string desc, ProjectType type, double lat, double lng,
        string addr, int? uniId, string? gh, string? demo, int[] tagIds, OwnerDto owner, int views, int daysAgo)
    {
        var images = new List<ProjectImageDto>
        {
            new(id * 10 + 1, $"/uploads/mock/{id}-1.jpg"),
            new(id * 10 + 2, $"/uploads/mock/{id}-2.jpg"),
        };
        return new ProjectDetailDto(id, title, desc, type, lat, lng, addr, uniId,
            Universities.FirstOrDefault(u => u.Id == uniId)?.Name, gh, demo, images[0].ImageUrl, images,
            Tags.Where(t => tagIds.Contains(t.Id)).ToList(), owner, views, DateTime.UtcNow.AddDays(-daysAgo));
    }
}