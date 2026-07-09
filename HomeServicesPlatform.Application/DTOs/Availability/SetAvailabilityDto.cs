using System;
using System.Collections.Generic;

namespace HomeServicesPlatform.Application.DTOs.Availability
{
    // What the provider sends us: a list of working windows for the week
    public class SetAvailabilityDto
    {
        public List<AvailabilitySlotDto> Slots { get; set; } = new();
    }

    public class AvailabilitySlotDto
    {
        public DayOfWeek DayOfWeek { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}