using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Domain.Common;
using HomeServicesPlatform.Domain.Enums;
namespace HomeServicesPlatform.Domain.Models
{
    public class Booking : BaseEntity
    {
        // BookingStatus: 0=Pending, 1=Confirmed, 2=Completed, 3=Paid
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
        public string Notes { get; set; } = string.Empty;
        public string ProviderNotes { get; set; } = string.Empty;
        public string ServiceDeliveryAddress { get; set; } = string.Empty;
        public string ContactPhoneNumber { get; set; } = string.Empty;
        public decimal PaidAmount { get; set; }
        public bool IsPaymentVerified { get; set; }
        public string PaymentStatus { get; set; } = "Pending";
        public string PaymentMethod { get; set; } = "Cash";
        public bool HasCustomerReviewed { get; set; }
        public bool HasProviderReviewed { get; set; }

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