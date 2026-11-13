using System;
using PortfolioMap.Api.Dtos.Company;

namespace PortfolioMap.Api.Dtos.Contacts
{
    public class InboxMessageDto
    {
        public int Id { get; set; }
        public CompanySummaryDto FromCompany { get; set; } = new();
        public string Subject { get; set; } = string.Empty;
        public string? ProjectTitle { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}