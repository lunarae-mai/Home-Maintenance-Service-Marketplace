namespace HomeServicesPlatform.API.Controllers
{
<<<<<<< Updated upstream
    public class BookingController 
    {
       
    }
}
=======
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    {/// <summary>
/// Provides endpoints for creating and managing service bookings.
/// </summary>
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }
/// <summary>
/// Creates a new booking for a selected service provider.
/// </summary>
/// <param name="request">The booking information.</param>
/// <returns>The created booking.</returns>
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(customerId))
            return Unauthorized();

        try
        {
            var result = await _bookingService.CreateBookingAsync(customerId, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }



    [HttpPut("{id}/confirm")]
    [Authorize(Roles = "Provider")]   
    public async Task<IActionResult> ConfirmBooking(int id)
    {
        try
        {
            var result = await _bookingService.ConfirmBookingAsync(id);
            return Ok(result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }
/// <summary>
/// Cancels an existing booking.
/// </summary>
/// <param name="id">The booking identifier.</param>
/// <returns>A confirmation that the booking has been cancelled.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Customer,Provider")]  
    public async Task<IActionResult> CancelBooking(int id)
    {
        try
        {
            var result = await _bookingService.CancelBookingAsync(id);
            return Ok(result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

/// <summary>
/// Retrieves all bookings created by the authenticated user.
/// </summary>
/// <returns>A list of the user's bookings.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
    [HttpGet("customer/{customerId}/history")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetBookingHistory(string customerId)
    {
        var active =
            await _bookingService.GetCustomerActiveBookingsAsync(customerId);

        var past =
            await _bookingService.GetCustomerPastBookingsAsync(customerId);

        return Ok(new
        {
            ActiveBookings = active,
            PastBookings = past
        });
    }


    [HttpGet("provider/{providerId}/incoming-requests")]
    [Authorize(Roles = "Provider")]
    public async Task<IActionResult> GetIncomingRequests(int providerId)
    {
        var requests =
            await _bookingService.GetIncomingRequestsAsync(providerId);

        return Ok(requests);
    }

    //[HttpPut("{bookingId}/status")]
    //public async Task<IActionResult> UpdateStatus(
    //int bookingId,
    //BookingStatus status)
    //{
    //    await _bookingService
    //        .UpdateBookingStatusAsync(bookingId, status);

    //    return Ok("Status updated successfully");
    //}


    [HttpGet("provider/{providerId}/today-schedule")]
    [Authorize(Roles = "Provider")]
    public async Task<IActionResult> GetTodaySchedule(int providerId)
    {
        var schedule =
            await _bookingService.GetTodayScheduleAsync(providerId);

        return Ok(schedule);
        }
    }
}
>>>>>>> Stashed changes
