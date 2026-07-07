namespace HomeServicesPlatform.Application.DTOs.Payment
{
    public class PaymentDto
{
    public int Id { get; set; }
    public decimal FinalAmount { get; set; }
    public decimal Commission { get; set; }
    public decimal ProviderEarnings { get; set; }
    public string Method { get; set; }= string.Empty;
    public string PaymentStatus { get; set; }= "Pending";
    public DateTime? PaidAt { get; set; }
    public int BookingId { get; set; }
}
}