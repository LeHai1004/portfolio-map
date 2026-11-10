using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PortfolioMap.Api.Data;
using PortfolioMap.Api.Dtos.Users;
using PortfolioMap.Api.Models;

namespace PortfolioMap.Api.Services;

public sealed class UserService : IUserService
{
    private const long MaxAvatarBytes = 5 * 1024 * 1024;
    private readonly AppDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;
    private readonly UserManager<AppUser> _userManager;

    public UserService(
        AppDbContext dbContext,
        IWebHostEnvironment environment,
        UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _environment = environment;
        _userManager = userManager;
    }

    public async Task<UserProfileResponse?> GetUserProfileAsync(
        string userId,
        CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users
            .Include(candidate => candidate.StudentProfile)
            .SingleOrDefaultAsync(candidate => candidate.Id == userId, cancellationToken);
        if (user is null)
        {
            return null;
        }

        var role = await GetUserRoleAsync(user, cancellationToken);
        return ToResponse(user, role);
    }

    public async Task<UserProfileResponse?> UpdateProfileAsync(
        string userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken)
    {
        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            return null;
        }

        var role = await GetUserRoleAsync(user, cancellationToken);
        if (role == "Student" &&
            request.UniversityId is { } universityId &&
            !await _dbContext.Universities.AnyAsync(
                university => university.Id == universityId,
                cancellationToken))
        {
            throw ValidationError("universityId", "Trường không tồn tại");
        }

        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            throw IdentityValidationError("Cập nhật hồ sơ thất bại", updateResult.Errors, "fullName");
        }

        if (role == "Student")
        {
            var studentProfile = await _dbContext.StudentProfiles
                .SingleOrDefaultAsync(profile => profile.UserId == userId, cancellationToken);
            if (studentProfile is null)
            {
                studentProfile = new StudentProfile { UserId = userId };
                _dbContext.StudentProfiles.Add(studentProfile);
            }

            studentProfile.UniversityId = request.UniversityId;
            studentProfile.Major = request.Major;
            studentProfile.GithubUrl = request.GithubUrl;
            studentProfile.LinkedInUrl = request.LinkedInUrl;
            user.StudentProfile = studentProfile;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return ToResponse(user, role);
    }

    public async Task ChangePasswordAsync(
        string userId,
        ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            throw new UserServiceException(StatusCodes.Status404NotFound, "Không tìm thấy người dùng");
        }

        var result = await _userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = result.Errors
                .GroupBy(error => error.Code == "PasswordMismatch" ? "currentPassword" : "newPassword")
                .ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray());
            throw new UserServiceException(StatusCodes.Status400BadRequest, "Đổi mật khẩu thất bại", errors);
        }
    }

    public async Task<string> UpdateAvatarAsync(
        string userId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var (extension, signatureLength) = await ValidateAvatarAsync(file, cancellationToken);
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
        {
            throw new UserServiceException(StatusCodes.Status404NotFound, "Không tìm thấy người dùng");
        }

        var webRootPath = string.IsNullOrWhiteSpace(_environment.WebRootPath)
            ? Path.Combine(_environment.ContentRootPath, "wwwroot")
            : _environment.WebRootPath;
        var avatarDirectory = Path.Combine(webRootPath, "avatars");
        Directory.CreateDirectory(avatarDirectory);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var filePath = Path.Combine(avatarDirectory, fileName);
        var avatarUrl = $"/avatars/{fileName}";
        var databaseUpdated = false;

        try
        {
            await SaveAvatarAsync(file, filePath, signatureLength, cancellationToken);
            user.AvatarUrl = avatarUrl;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                throw IdentityValidationError("Cập nhật ảnh đại diện thất bại", result.Errors, "avatar");
            }

            databaseUpdated = true;
            return avatarUrl;
        }
        finally
        {
            if (!databaseUpdated && File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }

    private async Task<string> GetUserRoleAsync(AppUser user, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Count != 1 || roles[0] is not ("Student" or "Company" or "Admin"))
        {
            throw new UserServiceException(
                StatusCodes.Status403Forbidden,
                "Tài khoản chưa được gán vai trò");
        }

        return roles[0];
    }

    private static UserProfileResponse ToResponse(AppUser user, string role)
    {
        var studentProfile = role == "Student" ? user.StudentProfile : null;
        return new UserProfileResponse(
            user.Id,
            user.FullName,
            user.Email!,
            user.AvatarUrl,
            role,
            studentProfile?.UniversityId,
            studentProfile?.Major,
            studentProfile?.GithubUrl,
            studentProfile?.LinkedInUrl);
    }

    private static async Task<(string Extension, int SignatureLength)> ValidateAvatarAsync(
        IFormFile file,
        CancellationToken cancellationToken)
    {
        if (file.Length is <= 0 or > MaxAvatarBytes)
        {
            throw ValidationError("file", "Ảnh phải có dung lượng từ 1 byte đến 5 MB");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var isJpeg = extension is ".jpg" or ".jpeg" && file.ContentType == "image/jpeg";
        var isPng = extension == ".png" && file.ContentType == "image/png";
        if (!isJpeg && !isPng)
        {
            throw ValidationError("file", "Chỉ nhận ảnh JPEG hoặc PNG");
        }

        var signatureLength = isJpeg ? 3 : 8;
        var signature = new byte[signatureLength];
        await using var stream = file.OpenReadStream();
        try
        {
            await stream.ReadExactlyAsync(signature, cancellationToken);
        }
        catch (EndOfStreamException)
        {
            throw ValidationError("file", "Nội dung file ảnh không hợp lệ");
        }

        var validSignature = isJpeg
            ? signature[0] == 0xFF && signature[1] == 0xD8 && signature[2] == 0xFF
            : signature.AsSpan().SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A });
        if (!validSignature)
        {
            throw ValidationError("file", "Nội dung file không khớp định dạng ảnh");
        }

        return (isJpeg ? ".jpg" : ".png", signatureLength);
    }

    private static async Task SaveAvatarAsync(
        IFormFile file,
        string filePath,
        int signatureLength,
        CancellationToken cancellationToken)
    {
        await using var input = file.OpenReadStream();
        await using var output = new FileStream(
            filePath,
            FileMode.CreateNew,
            FileAccess.Write,
            FileShare.None,
            81920,
            FileOptions.Asynchronous);
        var buffer = new byte[81920];
        long totalBytes = 0;
        int bytesRead;
        while ((bytesRead = await input.ReadAsync(buffer, cancellationToken)) > 0)
        {
            totalBytes += bytesRead;
            if (totalBytes > MaxAvatarBytes)
            {
                throw ValidationError("file", "Ảnh tối đa 5 MB");
            }

            await output.WriteAsync(buffer.AsMemory(0, bytesRead), cancellationToken);
        }

        if (totalBytes < signatureLength)
        {
            throw ValidationError("file", "Nội dung file ảnh không hợp lệ");
        }
    }

    private static UserServiceException IdentityValidationError(
        string message,
        IEnumerable<IdentityError> identityErrors,
        string defaultField)
    {
        var errors = identityErrors
            .GroupBy(error => error.Code == "InvalidPhoneNumber" ? "phoneNumber" : defaultField)
            .ToDictionary(group => group.Key, group => group.Select(error => error.Description).ToArray());
        return new UserServiceException(StatusCodes.Status400BadRequest, message, errors);
    }

    private static UserServiceException ValidationError(string field, string message) =>
        new(
            StatusCodes.Status400BadRequest,
            message,
            new Dictionary<string, string[]> { [field] = new[] { message } });
}
