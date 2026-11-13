using System;

namespace PortfolioMap.Api.Dtos.Contacts
{
    public class ContactDto
    {
        public int Id { get; set; }
        public string FromUserId { get; set; } = string.Empty;
        public string FromName { get; set; } = string.Empty;
        public string ToUserId { get; set; } = string.Empty;
        public string ToName { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}