namespace HomeServicesPlatform.Application.Interfaces
{
    public interface ISlotGeneratorService
    {
        // Generate slots for ONE provider for the next N days
        Task GenerateSlotsAsync(int providerId, int daysAhead = 7);

        // Generate slots for ALL providers (used by the background job)
        Task GenerateAllProvidersSlotsAsync(int daysAhead = 7);
    }
}
