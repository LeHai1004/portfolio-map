using PortfolioMap.Api.Dtos.Common;

namespace PortfolioMap.Api.Services;

public enum ProjectResultStatus { Ok, NotFound, Forbidden, Invalid }

/// <summary>Kết quả của service: controller đổi sang mã HTTP (200/404/403/400) theo Status.</summary>
public sealed class ProjectResult<T>
{
    public ProjectResultStatus Status { get; }
    public T? Value { get; }
    public ApiErrorResponse? Error { get; }

    private ProjectResult(ProjectResultStatus status, T? value, ApiErrorResponse? error)
    {
        Status = status;
        Value = value;
        Error = error;
    }

    public bool IsOk => Status == ProjectResultStatus.Ok;

    public static ProjectResult<T> Ok(T value) => new(ProjectResultStatus.Ok, value, null);

    public static ProjectResult<T> NotFound(string message) =>
        new(ProjectResultStatus.NotFound, default, new ApiErrorResponse(message));

    public static ProjectResult<T> Forbidden(string message) =>
        new(ProjectResultStatus.Forbidden, default, new ApiErrorResponse(message));

    public static ProjectResult<T> Invalid(ApiErrorResponse error) =>
        new(ProjectResultStatus.Invalid, default, error);
}