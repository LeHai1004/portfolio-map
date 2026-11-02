using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Mock;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api/universities")]
public class UniversitiesController : ControllerBase
{
    /// <summary>Danh sách trường kèm tọa độ. Quyền: Public.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UniversityDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<UniversityDto>> GetAll() => Ok(MockProjectData.Universities);
}
