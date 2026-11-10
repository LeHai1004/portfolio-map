namespace PortfolioMap.Api.Services;

public sealed class UserServiceException : Exception
{
    public UserServiceException(
        int statusCode,
        string message,
        Dictionary<string, string[]>? errors = null)
        : base(message)
    {
        StatusCode = statusCode;
        Errors = errors ?? new Dictionary<string, string[]>();
    }

    public int StatusCode { get; }

    public Dictionary<string, string[]> Errors { get; }
}
