using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Entities;
using HomeServicesPlatform.Domain.Common;

namespace HomeMaintenanceServiceMarketplace.Models
{
    public class ProviderProfile : BaseEntity
    {
        public string Bio { get; set; } = string.Empty;
        public int Experience { get; set; } 
        public decimal AvgRating { get; set; }


        public ProviderStatus Status { get; set; } = ProviderStatus.PendingApproval;
        public bool IsApproved { get; set; } = false;


        // FK
        public string UserId { get; set; } = string.Empty;

        // Navigation
        public ApplicationUser User { get; set; } = null!;
    
    }
}
