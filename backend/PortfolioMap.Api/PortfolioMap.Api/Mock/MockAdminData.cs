using PortfolioMap.Api.Dtos.Admin;
using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Mock;

/// <summary>
/// DỮ LIỆU MẪU cho Admin API (giai đoạn hợp đồng). XÓA file này khi nối DB thật.
/// Danh sách dự án và user độc lập hoàn toàn với MockProjectData.
/// Dữ liệu chỉ nằm trong bộ nhớ: mọi thay đổi mất khi tắt app.
/// </summary>
public static class MockAdminData
{
    // ---- Dự án mẫu (bao gồm cả Hidden) ----

    private static readonly List<AdminProjectDto> _projects = new()
    {
        new(1, "App quản lý chi tiêu",   ProjectType.Mobile, "Active", "u1", "Nguyễn Văn A", DateTime.UtcNow.AddDays(-20)),
        new(2, "Website portfolio",       ProjectType.Web,    "Active", "u1", "Nguyễn Văn A", DateTime.UtcNow.AddDays(-15)),
        new(3, "Game platformer 2D",      ProjectType.Game,   "Active", "u2", "Trần Thị B",   DateTime.UtcNow.AddDays(-10)),
        new(4, "Nhận diện biển số xe",    ProjectType.AI,     "Hidden", "u3", "Lê Văn C",     DateTime.UtcNow.AddDays(-8)),
        new(5, "Hệ thống quản lý thư viện", ProjectType.Web, "Active", "u2", "Trần Thị B",   DateTime.UtcNow.AddDays(-5)),
        new(6, "Dự án đã ẩn (admin mock)", ProjectType.Web,  "Hidden", "u3", "Lê Văn C",     DateTime.UtcNow.AddDays(-3)),
        new(7, "Chatbot hỗ trợ sinh viên", ProjectType.AI,   "Active", "u4", "Phạm Thị D",   DateTime.UtcNow.AddDays(-2)),
        new(8, "App học từ vựng tiếng Anh", ProjectType.Mobile, "Active", "u4", "Phạm Thị D", DateTime.UtcNow.AddDays(-1)),
    };

    private static readonly object ProjectGate = new();

    public static IReadOnlyList<AdminProjectDto> Projects
    {
        get { lock (ProjectGate) return _projects.ToList(); }
    }

    public static void ReplaceProject(AdminProjectDto updated)
    {
        lock (ProjectGate)
        {
            var i = _projects.FindIndex(p => p.Id == updated.Id);
            if (i >= 0) _projects[i] = updated;
        }
    }

    // ---- User mẫu ----

    private static readonly List<AdminUserDto> _users = new()
    {
        new("u1", "vana@student.vn",  "Nguyễn Văn A", "Student", false, DateTime.UtcNow.AddDays(-30)),
        new("u2", "thib@student.vn",  "Trần Thị B",   "Student", false, DateTime.UtcNow.AddDays(-25)),
        new("u3", "vanc@student.vn",  "Lê Văn C",     "Student", true,  DateTime.UtcNow.AddDays(-20)),
        new("u4", "thid@student.vn",  "Phạm Thị D",   "Student", false, DateTime.UtcNow.AddDays(-15)),
        new("u5", "vane@company.vn",  "Công ty E",    "Company", false, DateTime.UtcNow.AddDays(-10)),
        new("admin1", "admin@portfoliomap.vn", "Quản trị viên", "Admin", false, DateTime.UtcNow.AddDays(-60)),
    };

    private static readonly object UserGate = new();

    public static IReadOnlyList<AdminUserDto> Users
    {
        get { lock (UserGate) return _users.ToList(); }
    }

    public static void ReplaceUser(AdminUserDto updated)
    {
        lock (UserGate)
        {
            var i = _users.FindIndex(u => u.Id == updated.Id);
            if (i >= 0) _users[i] = updated;
        }
    }

    // ---- Giá trị hợp lệ ----

    public static readonly IReadOnlySet<string> ValidStatuses =
        new HashSet<string>(StringComparer.Ordinal) { "Active", "Hidden" };
}
