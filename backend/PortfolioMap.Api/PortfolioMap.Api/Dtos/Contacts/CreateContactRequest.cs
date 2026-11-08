using System.ComponentModel.DataAnnotations;

namespace PortfolioMap.Api.Dtos.Contacts
{
    public class CreateContactRequest
    {
        [Required]
        public int ProjectId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;
    }
}