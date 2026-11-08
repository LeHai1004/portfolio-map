using System;
using System.Collections.Generic;
using PortfolioMap.Api.Dtos.Company;
using PortfolioMap.Api.Dtos.Contacts;
using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Mock
{
    public static class MockCompanyData
    {
        // Giả lập database danh sách ID dự án đã lưu
        public static List<int> SavedProjectIds = new List<int> { 1, 5, 10 };
        
        // Dữ liệu mẫu dự án đã lưu
        public static List<SavedProjectDto> SavedProjects = new List<SavedProjectDto>
        {
            new SavedProjectDto
            {
                Id = 1,
                Title = "Dự án mẫu",
                Type = ProjectType.Web,
                ThumbnailUrl = "/thumb.jpg",
                Latitude = 16.0738,
                Longitude = 108.1499,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                SavedAt = DateTime.UtcNow
            }
        };

        // Dữ liệu mẫu hộp thư đến
        public static List<InboxMessageDto> InboxMessages = new List<InboxMessageDto>
        {
            new InboxMessageDto
            {
                Id = 1,
                FromCompany = new CompanySummaryDto 
                { 
                    Id = "company-1", 
                    CompanyName = "Công ty TNHH ABC", 
                    LogoUrl = "/logo.png" 
                },
                Subject = "Mời phỏng vấn",
                ProjectTitle = "App Quản lý",
                Content = "Chúng tôi rất ấn tượng với dự án của bạn.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            }
        };
    }
}