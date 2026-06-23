using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Domain.Common;
namespace HomeServicesPlatform.Domain.Models
{
    public class Booking : BaseEntity
    {
        // Use BookingStatus Enum here (Pending, Confirmed, Completed, etc.)
        // في Booking.cs
        // 0: Pending, 1: Confirmed, 2: Completed, 3: Paid
        public int Status { get; set; }
        public string Notes { get; set; } = string.Empty;

        // Foreign Keys
        public string CustomerId { get; set; } = string.Empty;
        public int ProviderId { get; set; }
        public int ServiceId { get; set; } 
        public int SlotId { get; set; } 

        // Navigation Properties
        public ApplicationUser Customer { get; set; } = null!;
        public ProviderProfile Provider { get; set; } = null!;
        public Service Service { get; set; } = null!;
        public TimeSlot Slot { get; set; } = null!;
        public Payment Payment { get; set; } = null!;
    }
}