namespace HomeServicesPlatform.Application.DTOs.Booking
{
    /// <summary>
    /// DTO for updating the notes on an existing Pending booking.
    /// Only the Notes field is editable after a booking is created.
    /// </summary>
    public class UpdateBookingDto
    {
        /// <summary>
        /// The updated customer notes for the booking.
        /// Can be empty to clear existing notes.
        /// </summary>
        public string Notes { get; set; } = string.Empty;
    }
}
