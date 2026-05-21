using HomeServicesPlatform.Domain.Common;
using System;

namespace HomeServicesPlatform.Domain.Models
{
    public class ProviderAvailability : BaseEntity
    {
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; } = true;

        // Foreign Key
        public int ProviderId { get; set; } 

        // Navigation Property (One-to-many link with ProviderProfile)
        public ProviderProfile Provider { get; set; } = null!;
    }
}