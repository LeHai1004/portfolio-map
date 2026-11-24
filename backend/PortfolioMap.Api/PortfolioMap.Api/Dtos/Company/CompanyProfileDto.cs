namespace PortfolioMap.Api.Dtos.Company;

public record CompanyProfileDto(
    string Id,
    string CompanyName,
    string? Website,
    string? Address,
    string? Description,
    string? LogoUrl);
