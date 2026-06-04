namespace HomeServicesPlatform.Application.DTOs.Availability
{
    public class SetAvailabilityDto
    {
        // e.g. DayOfWeek.Monday (0=Sunday, 1=Monday … 6=Saturday)
        public DayOfWeek DayOfWeek { get; set; }

        // Send as string: "09:00:00"
        public string StartTime { get; set; } = "";
        public string EndTime   { get; set; } = "";
        public bool IsAvailable { get; set; } = true;
    }
}
