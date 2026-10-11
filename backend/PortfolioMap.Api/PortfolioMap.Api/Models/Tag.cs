namespace PortfolioMap.Api.Models;

public class Tag
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public List<ProjectTag> ProjectTags { get; set; } = new();
}