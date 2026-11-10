namespace PortfolioMap.Api.Dtos.Users;

/// <summary>Thông tin hồ sơ người dùng có thể hiển thị công khai.</summary>
public sealed record UserProfileResponse(
    string Id,
    string FullName,
    string? AvatarUrl,
    string Role,
    int? UniversityId,
    string? Major,
    string? GithubUrl,
    string? LinkedInUrl);
