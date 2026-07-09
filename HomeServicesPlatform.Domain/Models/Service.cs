using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Domain.Common;
using System.Collections.Generic;

namespace HomeServicesPlatform.Domain.Models
{
    public class Service : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int Duration { get; set; } // Duration in minutes
        public string PriceModel { get; set; } = string.Empty;

        // Foreign Key
        public int ServiceCategoryId { get; set; } 

        // Navigation Properties
        public ServiceCategory ServiceCategory { get; set; } = null!;
        public ICollection<ProviderService> ProviderServices { get; set; } = new List<ProviderService>();
    }
}