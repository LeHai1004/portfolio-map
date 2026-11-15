using System;
using PortfolioMap.Api.Dtos.Company;
using PortfolioMap.Api.Dtos.Contacts;
using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Mock;

public static class MockCompanyData
{
    public const string CurrentCompanyId = "company-1";
    public const string CurrentCompanyName = "Công ty TNHH ABC";
    private static int _nextContactId = 1;

    public static List<SavedProjectDto> SavedProjects { get; } = new()
    {
        new(
            new ProjectSummaryDto(
                1,
                "App quản lý chi tiêu",
                ProjectType.Mobile,
                "/uploads/mock/1-1.jpg",
                16.0738,
                108.1499,
                DateTime.UtcNow.AddDays(-5)),
            DateTime.UtcNow)
    };

    public static List<ContactDto> Contacts { get; } = new()
    {
        new ContactDto
        {
            Id = 1,
            FromUserId = CurrentCompanyId,
            FromName = CurrentCompanyName,
            ToUserId = MockProjectData.CurrentUserId,
            ToName = "Nguyễn Văn A",
            ProjectId = 1,
            ProjectTitle = "App quản lý chi tiêu",
            Subject = "Mời phỏng vấn",
            Content = "Chúng tôi rất ấn tượng với dự án của bạn.",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        }
    };

    public static int NextContactId() => System.Threading.Interlocked.Increment(ref _nextContactId);
}