using PortfolioMap.Api.Dtos.Auth;
using System;

namespace PortfolioMap.Api.Dtos.Auth
{
    public class LoginResponse
    {
        public string AccessToken { get; set; }
        public DateTime ExpiresAt { get; set; }
        public UserDto User { get; set; }
    }
}