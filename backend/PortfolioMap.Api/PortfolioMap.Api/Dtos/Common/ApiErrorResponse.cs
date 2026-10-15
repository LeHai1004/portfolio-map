namespace PortfolioMap.Api.Dtos.Common;

public record ApiErrorResponse(string Message, Dictionary<string, string[]>? Errors = null);