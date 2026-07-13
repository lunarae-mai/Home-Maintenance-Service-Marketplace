using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Domain.Common;

namespace HomeServicesPlatform.Domain.Models
{
    public class ProviderProfile : BaseEntity
    {
        public string Bio { get; set; } = string.Empty;
        public int Experience { get; set; } 
        public decimal AvgRating { get; set; }


        public ProviderStatus Status { get; set; } = ProviderStatus.PendingApproval;
        public bool IsApproved { get; set; } = false;


        // FK
        public String UserId { get; set; } = string.Empty;

        // Navigation
        public ApplicationUser User { get; set; } = null!;

        // Navigation: This allows us to see all services offered by this provider
        public ICollection<ProviderService> ProviderServices { get; set; } = new List<ProviderService>();

        // Navigation: This allows us to see all bookings tied to this provider
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
