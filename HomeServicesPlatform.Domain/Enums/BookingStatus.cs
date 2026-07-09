namespace HomeServicesPlatform.Domain.Enums
{
    public enum BookingStatus
    {
        Pending = 0,
        Confirmed = 1,
        InProgress = 2,  // Work has started
        Completed = 3,   // Work is done, awaiting payment
        Paid = 4,        // Payment completed, can review
        Cancelled = 5,

        Rejected = 6   // Provider rejected the booking
    }
}
