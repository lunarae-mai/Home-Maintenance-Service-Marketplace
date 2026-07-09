namespace HomeServicesPlatform.Application.DTOs.Review{
public class ReviewDto
{
    public int Id { get; set; }

    public int Rating { get; set; }

    public string Comment { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public int BookingId { get; set; }

    public int CustomerId { get; set; }

    public int ProviderId { get; set; }
}}