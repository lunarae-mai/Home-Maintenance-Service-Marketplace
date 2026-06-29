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
    }
}