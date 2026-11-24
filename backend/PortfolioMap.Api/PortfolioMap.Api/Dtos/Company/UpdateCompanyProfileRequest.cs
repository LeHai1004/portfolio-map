namespace PortfolioMap.Api.Dtos.Company;

public record UpdateCompanyProfileRequest(
    string? CompanyName,
    string? Website,
    string? Address,
    string? Description,
    string? LogoUrl);
