using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Domain.Common;
using System;

namespace HomeServicesPlatform.Domain.Models
{
    public class Review : BaseEntity
    {
        // Enum: Customer or Provider
        public string ReviewerType { get; set; } = string.Empty;
        public int Rating { get; set; } // 1 to 5
        public string Comment { get; set; } = string.Empty;

        // Foreign Keys
        public int BookingId { get; set; }
        public string ReviewerId { get; set; } = string.Empty;
        public string RevieweeId { get; set; } = string.Empty;

        // Navigation Properties
        public Booking Booking { get; set; } = null!;
        public ApplicationUser Reviewer { get; set; } = null!;
        public ApplicationUser Reviewee { get; set; } = null!;
    }
}