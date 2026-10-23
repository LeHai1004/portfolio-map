using System.Threading.Tasks;
using PortfolioMap.Api.Dtos.Auth;

namespace PortfolioMap.Api.Services
{
    public class ServiceResult<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public object Errors { get; set; } = new { };
        public T? Data { get; set; }
    }

    public interface IAuthService
    {
        Task<ServiceResult<RegisterResponse>> RegisterAsync(RegisterRequest request);
        Task<ServiceResult<LoginResponse>> LoginAsync(LoginRequest request);
        Task<ServiceResult<UserDto>> GetMeAsync(string userId);
    }
}