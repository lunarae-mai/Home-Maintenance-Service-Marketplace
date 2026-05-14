using HomeServicesPlatform.Domain.Common;
namespace HomeMaintenanceServiceMarketplace.Models
{
    public class ProviderService: BaseEntity
    {
        // FK
        public int ProviderId { get; set; } 
        public int ServiceId { get; set; }

        // Navigation
        public ProviderProfile Provider { get; set; } = null!;
        public Service Service { get; set; } = null!;


        public decimal BasePrice { get; set; }        

    }
}
