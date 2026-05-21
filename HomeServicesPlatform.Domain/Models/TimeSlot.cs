using HomeServicesPlatform.Domain.Common;
using System;

namespace HomeServicesPlatform.Domain.Models
{
    public class TimeSlot : BaseEntity
    {
        public int ProviderId { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsBooked { get; set; } = false;

        // Navigation Property: Links the time slot back to the provider's profile
        public ProviderProfile Provider { get; set; } = null!;
    }
}