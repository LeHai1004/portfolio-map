using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Dtos.Interaction;

public record CommentDto(int Id, string Content, DateTime CreatedAt, OwnerDto Author);
