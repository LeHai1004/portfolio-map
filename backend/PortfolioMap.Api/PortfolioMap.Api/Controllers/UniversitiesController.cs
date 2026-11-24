using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Services;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api/universities")]
public class UniversitiesController : ControllerBase
{
    private readonly IProjectsService _projects;

    public UniversitiesController(IProjectsService projects) => _projects = projects;

    /// <summary>Danh sách trường kèm tọa độ. Quyền: Public.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UniversityDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<UniversityDto>>> GetAll(CancellationToken ct) =>
        Ok(await _projects.GetUniversitiesAsync(ct));
}