using System.Text.Json.Serialization;

namespace PortfolioMap.Api.Dtos.Projects;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProjectType
{
    Web,
    Mobile,
    Game,
    AI,
    Other
}