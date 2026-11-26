using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Dtos.Ai;

public sealed record AiProjectDto(int Id, string Title, ProjectType Type);
