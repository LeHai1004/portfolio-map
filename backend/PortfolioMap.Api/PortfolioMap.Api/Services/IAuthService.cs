using System.Threading.Tasks;
using PortfolioMap.Api.Dtos.Auth;

namespace PortfolioMap.Api.Services
{
    public interface IAuthService
    {
        Task<(bool Success, string ErrorMessage, int StatusCode, RegisterResponse Data)> RegisterAsync(RegisterRequest request);
        Task<(bool Success, string ErrorMessage, int StatusCode, LoginResponse Data)> LoginAsync(LoginRequest request);
        Task<UserDto> GetMeAsync(int userId);
    }
}