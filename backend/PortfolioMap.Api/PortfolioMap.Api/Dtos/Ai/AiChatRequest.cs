using System.ComponentModel.DataAnnotations;

namespace PortfolioMap.Api.Dtos.Ai;

public sealed class AiChatRequest
{
    [Required(ErrorMessage = "Tin nhắn là bắt buộc")]
    [StringLength(500, ErrorMessage = "Tin nhắn không được vượt quá 500 ký tự")]
    public string Message { get; init; } = string.Empty;

    public IReadOnlyList<AiHistoryItem?>? History { get; init; }
}
