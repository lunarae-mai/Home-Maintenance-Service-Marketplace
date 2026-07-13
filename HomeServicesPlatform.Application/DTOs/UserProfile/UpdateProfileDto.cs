using System.ComponentModel.DataAnnotations;

namespace HomeServicesPlatform.Application.DTOs.UserProfile
{
    public class UpdateProfileDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Phone]
        public string? Phone { get; set; }
    }
}
