using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IAppDbContext _context;

        public BookingController(IAppDbContext context)
        {
            _context = context;
        }

        // PUT api/booking/5/status?status=Cancelled
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(
            int id, [FromQuery] BookingStatus status)
        {
            // Load the booking AND its linked slot in one query
            var booking = await _context.Bookings
                .Include(b => b.Slot)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            // Update the booking status
            booking.Status = (int)status;

            // KEY LOGIC: if rejected or cancelled → free the slot
            if (status == BookingStatus.Rejected ||
                status == BookingStatus.Cancelled)
            {
                if (booking.Slot != null)
                    booking.Slot.IsBooked = false; // ← slot is free again
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Booking is now {status}." });
        }
    }
}