using HomeServicesPlatform.Application.Interfaces;

namespace HomeServicesPlatform.API.BackgroundJobs
{
    public class SlotGenerationJob : BackgroundService
    {
        // IServiceScopeFactory lets us create a fresh DI scope
        // because BackgroundService is Singleton but our services are Scoped
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SlotGenerationJob> _logger;

        public SlotGenerationJob(
            IServiceScopeFactory scopeFactory,
            ILogger<SlotGenerationJob> logger)
        {
            _scopeFactory = scopeFactory;
            _logger       = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Slot generation job started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Create a fresh scope for each run (required for Scoped services)
                    using var scope = _scopeFactory.CreateScope();
                    var generator = scope.ServiceProvider
                        .GetRequiredService<ISlotGeneratorService>();

                    _logger.LogInformation("Running nightly slot generation...");
                    await generator.GenerateAllProvidersSlotsAsync(daysAhead: 14);
                    _logger.LogInformation("Nightly slot generation complete.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in slot generation job.");
                }

                // Wait 24 hours before running again
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}