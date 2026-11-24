using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PortfolioMap.Api.Dtos.Common;
using PortfolioMap.Api.Dtos.Users;
using PortfolioMap.Api.Services;

namespace PortfolioMap.Api.Controllers;

/// <summary>API hồ sơ người dùng.</summary>
[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>Xem hồ sơ công khai của người dùng.</summary>
    [AllowAnonymous]
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<UserProfileResponse>> GetUserProfile(
        string id,
        CancellationToken cancellationToken)
    {
        try
        {
            var profile = await _userService.GetUserProfileAsync(id, cancellationToken);
            return profile is null
                ? NotFound(new ApiErrorResponse("Không tìm thấy người dùng"))
                : Ok(profile);
        }
        catch (UserServiceException exception)
        {
            return ServiceError(exception);
        }
    }

    /// <summary>Cập nhật hồ sơ của người đang đăng nhập.</summary>
    [Authorize]
    [HttpPut("me")]
    [ProducesResponseType(typeof(UserProfileResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> UpdateProfile(
        [FromBody] UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new ApiErrorResponse("Token không có thông tin người dùng"));
        }

        try
        {
            var profile = await _userService.UpdateProfileAsync(userId, request, cancellationToken);
            return profile is null
                ? NotFound(new ApiErrorResponse("Không tìm thấy người dùng"))
                : Ok(profile);
        }
        catch (UserServiceException exception)
        {
            return ServiceError(exception);
        }
    }

    /// <summary>Đổi mật khẩu của người đang đăng nhập.</summary>
    [Authorize]
    [HttpPut("me/password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new ApiErrorResponse("Token không có thông tin người dùng"));
        }

        try
        {
            await _userService.ChangePasswordAsync(userId, request, cancellationToken);
            return Ok(new { message = "Đổi mật khẩu thành công" });
        }
        catch (UserServiceException exception)
        {
            return ServiceError(exception);
        }
    }

    /// <summary>Tải ảnh đại diện (multipart/form-data, trường file).</summary>
    [Authorize]
    [HttpPost("me/avatar")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAvatar(
        [FromForm] IFormFile? file,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized(new ApiErrorResponse("Token không có thông tin người dùng"));
        }

        if (file is null)
        {
            return BadRequest(new ApiErrorResponse(
                "Chưa chọn file ảnh",
                new() { ["file"] = new[] { "File ảnh là bắt buộc" } }));
        }

        try
        {
            var avatarUrl = await _userService.UpdateAvatarAsync(userId, file, cancellationToken);
            return Ok(new { avatarUrl });
        }
        catch (UserServiceException exception)
        {
            return ServiceError(exception);
        }
    }

    private bool TryGetUserId(out string userId)
    {
        userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
        return !string.IsNullOrWhiteSpace(userId);
    }

    private static ObjectResult ServiceError(UserServiceException exception) =>
        new ObjectResult(new ApiErrorResponse(exception.Message, exception.Errors))
        {
            StatusCode = exception.StatusCode
        };
}
