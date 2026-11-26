namespace PortfolioMap.Api.Dtos.Ai;

public sealed record AiChatResponse(string Reply, IReadOnlyList<AiProjectDto> Projects);
