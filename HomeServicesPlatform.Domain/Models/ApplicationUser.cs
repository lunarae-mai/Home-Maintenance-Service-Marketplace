using HomeServicesPlatform.Domain.Common;

namespace HomeServicesPlatform.Domain.Models
{
    public class ApplicationUser 
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // This represents the user's role (e.g., Customer, Provider, Admin)
        public string Role { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}