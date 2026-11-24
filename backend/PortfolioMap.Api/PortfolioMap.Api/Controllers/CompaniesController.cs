using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Company;
using PortfolioMap.Api.Services;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api/companies")]
public class CompaniesController : ControllerBase
{
    private readonly ICompaniesService _companies;

    public CompaniesController(ICompaniesService companies) => _companies = companies;

    [HttpGet("{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(CompanyProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CompanyProfileDto>> GetById(
        string id,
        CancellationToken ct)
    {
        var result = await _companies.GetAsync(id, ct);
        return result.IsOk
            ? Ok(result.Value)
            : NotFound(result.Error);
    }

    [HttpPut("me")]
    [Authorize(Roles = "Company")]
    [ProducesResponseType(typeof(CompanyProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<CompanyProfileDto>> UpdateMe(
        [FromBody] UpdateCompanyProfileRequest request,
        CancellationToken ct)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized(new ApiErrorResponse(
                "Chưa đăng nhập hoặc token sai"));
        }

        var result = await _companies.UpsertAsync(userId, request, ct);
        if (result.IsOk) return Ok(result.Value);

        return result.Status switch
        {
            CompanyResultStatus.Invalid => BadRequest(result.Error),
            CompanyResultStatus.NotFound => NotFound(result.Error),
            _ => StatusCode(StatusCodes.Status500InternalServerError, result.Error)
        };
    }
}
