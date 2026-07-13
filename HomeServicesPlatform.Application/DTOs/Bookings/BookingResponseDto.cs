using HomeServicesPlatform.Domain.Enums;
using System;

namespace HomeServicesPlatform.Application.DTOs.Booking
{
    public class BookingResponseDto
    {
        public int Id { get; set; }
        public string CustomerId { get; set; } = string.Empty;
        public int ProviderId { get; set; }
        public int ServiceId { get; set; }
        public int SlotId { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string ProviderNotes { get; set; } = string.Empty;
        public string ServiceDeliveryAddress { get; set; } = string.Empty;
        public string ContactPhoneNumber { get; set; } = string.Empty;
        public decimal PaidAmount { get; set; }
        public bool IsPaymentVerified { get; set; }
        public string PaymentStatus { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = string.Empty;
        public bool HasCustomerReviewed { get; set; }
        public bool HasProviderReviewed { get; set; }
        public BookingStatus Status { get; set; }    
        public string StatusLabel { get; set; } = string.Empty; //Confirmed/pending...
        public DateTime CreatedAt { get; set; }
    }
}