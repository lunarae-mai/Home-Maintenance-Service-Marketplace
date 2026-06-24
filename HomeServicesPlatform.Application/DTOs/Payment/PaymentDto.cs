namespace HomeServicesPlatform.Application.DTOs.Payment
{
    public class CreatePaymentDto
    {
        public int BookingId { get; set; }
        public decimal FinalAmount { get; set; } 
        public string Method { get; set; } = "Cash";
    }
}