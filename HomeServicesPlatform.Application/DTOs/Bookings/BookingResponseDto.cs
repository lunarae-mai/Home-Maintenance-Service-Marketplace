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
        public BookingStatus Status { get; set; }    
        public string StatusLabel { get; set; } = string.Empty; //Confirmed/pending...
        public DateTime CreatedAt { get; set; }
    }
}