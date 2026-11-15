using System.ComponentModel.DataAnnotations;

namespace PortfolioMap.Api.Dtos.Contacts;

public class CreateContactRequest
{
    [Required]
    public int? ProjectId { get; set; }

    public string? Subject { get; set; }

    public string? Content { get; set; }
}