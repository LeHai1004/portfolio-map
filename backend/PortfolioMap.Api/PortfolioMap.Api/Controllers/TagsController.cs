using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Projects;
using PortfolioMap.Api.Mock;

namespace PortfolioMap.Api.Controllers;

[ApiController]
[Route("api/tags")]
public class TagsController : ControllerBase
{
    /// <summary>Danh sách tag công nghệ. Quyền: Public.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<TagDto>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<TagDto>> GetAll() => Ok(MockProjectData.Tags);
}
