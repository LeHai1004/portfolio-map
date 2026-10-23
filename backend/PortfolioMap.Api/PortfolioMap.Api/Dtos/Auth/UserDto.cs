namespace PortfolioMap.Api.Dtos.Auth
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; }
        public string FullName { get; set; }
        public string Role { get; set; }
        public string AvatarUrl { get; set; }
    }
}