using PortfolioMap.Api.Dtos.Ai;

namespace PortfolioMap.Api.Services;

public interface IAiChatService
{
    Task<AiChatResponse> ChatAsync(
        AiChatRequest request,
        CancellationToken cancellationToken = default);
}
