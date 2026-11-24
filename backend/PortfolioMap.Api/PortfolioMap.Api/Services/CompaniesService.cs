using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Company;
using PortfolioMap.Api.Models;

namespace PortfolioMap.Api.Services;

public sealed class CompaniesService : ICompaniesService
{
    private readonly AppDbContext _db;

    public CompaniesService(AppDbContext db) => _db = db;

    public async Task<CompanyResult> GetAsync(string userId, CancellationToken ct = default)
    {
        var profile = await _db.CompanyProfiles
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.UserId == userId, ct);

        return profile is null
            ? CompanyResult.NotFound("Không tìm thấy hồ sơ công ty")
            : CompanyResult.Ok(ToDto(profile));
    }

    public async Task<CompanyResult> UpsertAsync(
        string userId,
        UpdateCompanyProfileRequest request,
        CancellationToken ct = default)
    {
        var companyName = request.CompanyName?.Trim() ?? string.Empty;
        var website = request.Website?.Trim();
        var address = request.Address?.Trim();
        var description = request.Description?.Trim();
        var logoUrl = request.LogoUrl?.Trim();

        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(companyName))
            errors["companyName"] = new[] { "Tên công ty không được để trống" };
        else if (companyName.Length > 200)
            errors["companyName"] = new[] { "Tên công ty tối đa 200 ký tự" };
        if (website?.Length > 300)
            errors["website"] = new[] { "Website tối đa 300 ký tự" };
        if (address?.Length > 300)
            errors["address"] = new[] { "Address tối đa 300 ký tự" };
        if (logoUrl?.Length > 500)
            errors["logoUrl"] = new[] { "LogoUrl tối đa 500 ký tự" };

        if (errors.Count > 0)
            return CompanyResult.Invalid(
                new ApiErrorResponse("Dữ liệu đầu vào không hợp lệ", errors));

        var userExists = await _db.Users
            .AsNoTracking()
            .AnyAsync(user => user.Id == userId, ct);
        if (!userExists)
            return CompanyResult.NotFound("Không tìm thấy người dùng");

        var profile = await _db.CompanyProfiles
            .SingleOrDefaultAsync(item => item.UserId == userId, ct);
        if (profile is null)
        {
            profile = new CompanyProfile { UserId = userId };
            _db.CompanyProfiles.Add(profile);
        }

        profile.CompanyName = companyName;
        profile.Website = website;
        profile.Address = address;
        profile.Description = description;
        profile.LogoUrl = logoUrl;

        await _db.SaveChangesAsync(ct);
        return CompanyResult.Ok(ToDto(profile));
    }

    private static CompanyProfileDto ToDto(CompanyProfile profile) =>
        new(
            profile.UserId,
            profile.CompanyName,
            profile.Website,
            profile.Address,
            profile.Description,
            profile.LogoUrl);
}
