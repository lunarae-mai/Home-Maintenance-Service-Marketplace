using HomeServicesPlatform.Application.DTOs.Availability;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HomeServicesPlatform.Application.Services
{
    public class AvailabilityService : IAvailabilityService
    {
        private readonly IAppDbContext _context;
        private readonly ILogger<AvailabilityService> _logger;

        public AvailabilityService(IAppDbContext context, ILogger<AvailabilityService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<AvailabilityResponseDto>> SetWeeklyAvailabilityAsync(int providerId, SetAvailabilityDto dto)
        {
            // Basic validation: start must be before end for every entry
            foreach (var slot in dto.Slots)
            {
                if (slot.StartTime >= slot.EndTime)
                    throw new InvalidOperationException(
                        $"Invalid time range for {slot.DayOfWeek}: start time must be before end time.");
            }

            // Remove this provider's existing weekly schedule, then replace it
            var existing = _context.ProviderAvailabilities.Where(a => a.ProviderId == providerId);
            _context.ProviderAvailabilities.RemoveRange(existing);

            var newEntries = dto.Slots.Select(s => new ProviderAvailability
            {
                ProviderId = providerId,
                DayOfWeek = s.DayOfWeek,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                IsAvailable = true
            }).ToList();

            await _context.ProviderAvailabilities.AddRangeAsync(newEntries);
            await _context.SaveChangesAsync();

            return newEntries.Select(MapToDto);
        }

        public async Task<IEnumerable<AvailabilityResponseDto>> GetWeeklyAvailabilityAsync(int providerId)
        {
            var entries = await _context.ProviderAvailabilities
                .Where(a => a.ProviderId == providerId)
                .ToListAsync();

            return entries.Select(MapToDto);
        }

        private static AvailabilityResponseDto MapToDto(ProviderAvailability a) => new()
        {
            Id = a.Id,
            ProviderId = a.ProviderId,
            DayOfWeek = a.DayOfWeek,
            StartTime = a.StartTime,
            EndTime = a.EndTime,
            IsAvailable = a.IsAvailable
        };

        public async Task<IEnumerable<TimeSlotDto>> GenerateSlotsAsync(int providerId, DateTime fromDate, int daysAhead = 7)
        {
            var weeklyAvailability = await _context.ProviderAvailabilities
                .Where(a => a.ProviderId == providerId && a.IsAvailable)
                .ToListAsync();

            if (!weeklyAvailability.Any())
                throw new InvalidOperationException("This provider has not set any weekly availability yet.");

            // Find slots that already exist in this date range so we never duplicate them
            var rangeEnd = fromDate.Date.AddDays(daysAhead);
            var existingSlots = await _context.TimeSlots
                .Where(s => s.ProviderId == providerId
                         && s.Date >= fromDate.Date
                         && s.Date < rangeEnd)
                .Select(s => new { s.Date, s.StartTime })
                .ToListAsync();

            var existingKeys = existingSlots
                .Select(s => (s.Date.Date, s.StartTime))
                .ToHashSet();

            var newSlots = new List<TimeSlot>();

            for (int dayOffset = 0; dayOffset < daysAhead; dayOffset++)
            {
                var currentDate = fromDate.Date.AddDays(dayOffset);
                var dayAvailability = weeklyAvailability.Where(a => a.DayOfWeek == currentDate.DayOfWeek);

                foreach (var window in dayAvailability)
                {
                    var slotStart = window.StartTime;

                    // Walk forward in 1-hour increments until we hit the end of the window
                    while (slotStart.Add(TimeSpan.FromHours(1)) <= window.EndTime)
                    {
                        var key = (currentDate, slotStart);

                        if (!existingKeys.Contains(key))
                        {
                            newSlots.Add(new TimeSlot
                            {
                                ProviderId = providerId,
                                Date = currentDate,
                                StartTime = slotStart,
                                EndTime = slotStart.Add(TimeSpan.FromHours(1)),
                                IsBooked = false
                            });
                        }

                        slotStart = slotStart.Add(TimeSpan.FromHours(1));
                    }
                }
            }

            if (newSlots.Any())
            {
                await _context.TimeSlots.AddRangeAsync(newSlots);
                await _context.SaveChangesAsync();
            }

            return newSlots.Select(s => new TimeSlotDto
            {
                Id = s.Id,
                ProviderId = s.ProviderId,
                Date = s.Date,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                IsBooked = s.IsBooked
            });
        }
    
    public async Task DeleteExpiredSlotsAsync()
{
    var expired = await _context.TimeSlots
        .Where(s => s.Date < DateTime.Today)
        .ToListAsync();

    _context.TimeSlots.RemoveRange(expired);
    await _context.SaveChangesAsync();
}
    }
}