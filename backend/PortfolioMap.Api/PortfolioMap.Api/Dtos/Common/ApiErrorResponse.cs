namespace PortfolioMap.Api.Dtos.Common;

/// <summary>Dạng lỗi chung (Phần 5.1): message + errors theo từng ô nhập. errors luôn là object, không bao giờ null.</summary>
public record ApiErrorResponse(string Message, Dictionary<string, string[]> Errors)
{
    public ApiErrorResponse(string message) : this(message, new Dictionary<string, string[]>()) { }
}