using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Domain.Common;
using System.Collections.Generic;

namespace HomeServicesPlatform.Domain.Models
{
    public class ServiceCategory : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;

        // Navigation Property
        public ICollection<Service> Services { get; set; } = new List<Service>();
    }
}