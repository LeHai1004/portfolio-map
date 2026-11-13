using System;
using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Dtos.Company
{
    // Bỏ kế thừa để tránh lỗi constructor của Sỹ, viết lại đúng các trường cần thiết
    public class SavedProjectDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public ProjectType Type { get; set; } // Dùng enum ProjectType của Sỹ
        public string ThumbnailUrl { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime SavedAt { get; set; }
    }
}