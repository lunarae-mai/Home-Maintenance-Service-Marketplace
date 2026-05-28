using HomeServicesPlatform.Domain.Common;

namespace HomeServicesPlatform.Domain.Models
{
    public class ProviderService : BaseEntity
    {
        public decimal BasePrice { get; set; }
        public string PriceType { get; set; } = string.Empty; 

        // Foreign Keys 
        public int ProviderId { get; set; }
        public int ServiceId { get; set; }

        // Navigation
        public ProviderProfile Provider { get; set; } = null!;
        public Service Service { get; set; } = null!;
    }
}