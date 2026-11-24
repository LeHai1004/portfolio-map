using PortfolioMap.Api.Dtos.Users;

namespace PortfolioMap.Api.Services;

public interface IUserService
{
    Task<UserProfileResponse?> GetUserProfileAsync(string userId, CancellationToken cancellationToken);

    Task<UserProfileResponse?> UpdateProfileAsync(
        string userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken);

    Task ChangePasswordAsync(
        string userId,
        ChangePasswordRequest request,
        CancellationToken cancellationToken);

    Task<string> UpdateAvatarAsync(
        string userId,
        IFormFile file,
        CancellationToken cancellationToken);
}
