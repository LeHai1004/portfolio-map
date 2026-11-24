using System;
using PortfolioMap.Api.Dtos.Contacts;

namespace PortfolioMap.Api.Mock;

public static class MockCompanyData
{
    public const string CurrentCompanyId = "company-1";
    public const string CurrentCompanyName = "Công ty TNHH ABC";
    private static int _nextContactId = 1;

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