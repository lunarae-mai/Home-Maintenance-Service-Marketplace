using HomeServicesPlatform.Domain.Common;
using System;

namespace HomeServicesPlatform.Domain.Models
{
    public class Payment : BaseEntity
    {
        public decimal Amount { get; set; }
        public decimal Commission { get; set; }

        // Calculated property for provider's actual earnings
        public decimal ProviderEarnings => Amount - Commission;

        public string PaymentMethod { get; set; } = string.Empty; // Cash, Card, Wallet
        public string PaymentStatus { get; set; } = "Pending"; // Pending, Paid, Failed
        public DateTime? PaidAt { get; set; }

        // Foreign Key
        public int BookingId { get; set; }

        // Navigation Property
        public Booking Booking { get; set; } = null!;
    }
}