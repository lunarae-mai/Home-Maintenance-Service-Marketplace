using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]   // → api/booking
[Authorize]                   // all endpoints require a valid JWT
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

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
            return CreatedAtAction(nameof(GetMyBookings), new { }, result);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }

    [HttpPut("{id}/confirm")]
    [Authorize(Roles = "Provider")]   // only providers can confirm
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
    // StartBooking and CompleteBooking follow the exact same pattern

    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Customer,Provider")]  // either party can cancel
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
}