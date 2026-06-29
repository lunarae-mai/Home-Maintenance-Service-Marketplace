using HomeServicesPlatform.Application.DTOs.Availability;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IAvailabilityService
    {
        Task<IEnumerable<AvailabilityResponseDto>> SetWeeklyAvailabilityAsync(int providerId, SetAvailabilityDto dto);
        Task<IEnumerable<AvailabilityResponseDto>> GetWeeklyAvailabilityAsync(int providerId);
        Task<IEnumerable<TimeSlotDto>> GenerateSlotsAsync(int providerId, DateTime fromDate, int daysAhead = 7);    }
}