using PortfolioMap.Api.Dtos.Projects;

namespace PortfolioMap.Api.Dtos.Admin;

/// <summary>Thông tin dự án cho màn hình Admin. Bao gồm cả dự án Hidden.</summary>
public record AdminProjectDto(
    int Id,
    string Title,
    ProjectType Type,
    /// <summary>"Active" hoặc "Hidden"</summary>
    string Status,
    string OwnerId,
    string OwnerName,
    DateTime CreatedAt);
