namespace HomeServicesPlatform.Application.DTOs.Payment
{
    public class UpdatePaymentDto
    {
        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public string PaymentStatus { get; set; } = string.Empty;
    }
}