using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HomeServicesPlatform.Application.Services
{
    public class SlotGeneratorService : ISlotGeneratorService
    {
        private readonly IAppDbContext _context;
        private readonly ILogger<SlotGeneratorService> _logger;

        public SlotGeneratorService(IAppDbContext context,
            ILogger<SlotGeneratorService> logger)
        {
            _context = context;
            _logger  = logger;
        }

        public async Task GenerateSlotsAsync(int providerId, int daysAhead = 7)
        {
            // Load this provider's weekly availability rules
            var availabilities = await _context.ProviderAvailabilities
                .Where(a => a.ProviderId == providerId && a.IsAvailable)
                .ToListAsync();

            if (!availabilities.Any()) return;

            // Loop through each of the next N days
            var today = DateTime.UtcNow.Date;

            for (int i = 0; i < daysAhead; i++)
            {
                var date    = today.AddDays(i);
                var dayName = date.DayOfWeek;

                // Find the availability rule for this day of the week
                var rule = availabilities
                    .FirstOrDefault(a => a.DayOfWeek == dayName);

                if (rule == null) continue; // provider doesn't work this day

                // Split the working hours into 1-hour slots
                var current = rule.StartTime;
                while (current + TimeSpan.FromHours(1) <= rule.EndTime)
                {
                    var slotEnd = current + TimeSpan.FromHours(1);

                    // IMPORTANT: skip if this exact slot already exists in the DB
                    bool exists = await _context.TimeSlots.AnyAsync(s =>
                        s.ProviderId == providerId &&
                        s.Date       == date       &&
                        s.StartTime  == current);

                    if (!exists)
                    {
                        _context.TimeSlots.Add(new TimeSlot
                        {
                            ProviderId = providerId,
                            Date       = date,
                            StartTime  = current,
                            EndTime    = slotEnd,
                            IsBooked   = false
                        });
                    }

                    current = slotEnd; // move to next hour
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation(
                "Generated slots for provider {Id}", providerId);
        }

        public async Task GenerateAllProvidersSlotsAsync(int daysAhead = 7)
        {
            var providerIds = await _context.ProviderProfiles
                .Where(p => p.IsApproved)
                .Select(p => p.Id)
                .ToListAsync();

            foreach (var id in providerIds)
                await GenerateSlotsAsync(id, daysAhead);
        }
    }
}
