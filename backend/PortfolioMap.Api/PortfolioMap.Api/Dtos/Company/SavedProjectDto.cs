using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Dtos.Company;

public record SavedProjectDto(ProjectSummaryDto Project, DateTime SavedAt);