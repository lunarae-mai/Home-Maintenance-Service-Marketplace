using System;

namespace HomeServicesPlatform.Application.DTOs.Availability
{
    public class AvailabilityResponseDto
    {
        public int Id { get; set; }
        public int ProviderId { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsAvailable { get; set; }
    }
}