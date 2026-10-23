using System.Threading.Tasks;
using PortfolioMap.Api.Dtos.Auth;

namespace PortfolioMap.Api.Services
{
    public interface IAuthService
    {
        Task<(bool Success, string ErrorMessage, int StatusCode, IReadOnlyDictionary<string, string[]> Errors, RegisterResponse Data)> RegisterAsync(RegisterRequest request);
        Task<(bool Success, string ErrorMessage, int StatusCode, IReadOnlyDictionary<string, string[]> Errors, LoginResponse Data)> LoginAsync(LoginRequest request);
        Task<(bool Success, string ErrorMessage, int StatusCode, IReadOnlyDictionary<string, string[]> Errors, UserDto Data)> GetMeAsync(int userId);
    }
}