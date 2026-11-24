using PortfolioMap.Api.Dtos.Company;

namespace PortfolioMap.Api.Services;

public enum CompanyResultStatus
{
    Ok,
    NotFound,
    Invalid
}

public record CompanyResult(
    CompanyResultStatus Status,
    CompanyProfileDto? Value,
    Dtos.Common.ApiErrorResponse? Error)
{
    public bool IsOk => Status == CompanyResultStatus.Ok;

    public static CompanyResult Ok(CompanyProfileDto value) =>
        new(CompanyResultStatus.Ok, value, null);

    public static CompanyResult NotFound(string message) =>
        new(CompanyResultStatus.NotFound, null, new Dtos.Common.ApiErrorResponse(message));

    public static CompanyResult Invalid(Dtos.Common.ApiErrorResponse error) =>
        new(CompanyResultStatus.Invalid, null, error);
}

public interface ICompaniesService
{
    Task<CompanyResult> GetAsync(string userId, CancellationToken ct = default);

    Task<CompanyResult> UpsertAsync(
        string userId,
        UpdateCompanyProfileRequest request,
        CancellationToken ct = default);
}
