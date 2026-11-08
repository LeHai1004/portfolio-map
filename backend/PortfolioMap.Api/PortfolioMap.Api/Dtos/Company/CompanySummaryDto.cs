namespace PortfolioMap.Api.Dtos.Company
{
    public class CompanySummaryDto
    {
        public string Id { get; set; } = string.Empty;
        public string CompanyName { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }
    }
}