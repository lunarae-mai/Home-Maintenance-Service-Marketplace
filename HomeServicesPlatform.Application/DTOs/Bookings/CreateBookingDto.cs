using HomeServicesPlatform.Application.DTOs.Booking;

namespace HomeServicesPlatform.Application.DTOs.Booking
{
    public class CreateBookingDto
    {
        public int ProviderId { get; set; }
        public int ServiceId { get; set; }
        public int SlotId { get; set; }
        public string Notes { get; set; } = string.Empty;
        public string ServiceDeliveryAddress { get; set; } = string.Empty;
        public string ContactPhoneNumber { get; set; } = string.Empty;
    }
}