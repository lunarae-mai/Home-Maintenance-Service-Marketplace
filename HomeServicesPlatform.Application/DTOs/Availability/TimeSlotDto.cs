using System;

namespace HomeServicesPlatform.Application.DTOs.Availability
{
    public class TimeSlotDto
    {
        public int Id { get; set; }
        public int ProviderId { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public bool IsBooked { get; set; }
    }
}