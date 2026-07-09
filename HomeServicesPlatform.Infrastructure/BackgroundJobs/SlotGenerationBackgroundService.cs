using HomeServicesPlatform.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HomeServicesPlatform.Infrastructure.BackgroundJobs
{
    public class SlotGenerationBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<SlotGenerationBackgroundService> _logger;

        public SlotGenerationBackgroundService(
            IServiceProvider serviceProvider,
            ILogger<SlotGenerationBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RunNightlyGenerationAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Slot generation background job failed.");
                }

                // Wait until ~2 AM the next day, then repeat
                var now = DateTime.Now;
                var nextRun = now.Date.AddDays(1).AddHours(2);
                var delay = nextRun - now;

                await Task.Delay(delay, stoppingToken);
            }
        }

        private async Task RunNightlyGenerationAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IAppDbContext>();
            var availabilityService = scope.ServiceProvider.GetRequiredService<IAvailabilityService>();

            // Clean up past slots first
            await availabilityService.DeleteExpiredSlotsAsync();
                
            var providerIds = await context.ProviderAvailabilities
                .Select(a => a.ProviderId)
                .Distinct()
                .ToListAsync();

            foreach (var providerId in providerIds)
            {
                await availabilityService.GenerateSlotsAsync(providerId, DateTime.Today, daysAhead: 14);
            }

            _logger.LogInformation("Nightly slot generation completed for {Count} providers.", providerIds.Count);
        }
    }
}