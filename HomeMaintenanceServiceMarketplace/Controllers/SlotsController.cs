using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SlotsController : ControllerBase
    {
        private readonly IAppDbContext _context;
        private readonly ISlotGeneratorService _slotGenerator;

        public SlotsController(
            IAppDbContext context,
            ISlotGeneratorService slotGenerator)
        {
            _context      = context;
            _slotGenerator = slotGenerator;
        }

        // GET api/slots/available?providerId=3&date=2026-06-10
        // Returns only free (IsBooked=false) future slots
        [HttpGet("available")]
        public async Task<IActionResult> GetAvailableSlots(
            [FromQuery] int providerId,
            [FromQuery] DateTime date)
        {
            // Normalize: ignore time portion, compare date only
            var targetDate = date.Date;
            var now        = DateTime.UtcNow;

            var slots = await _context.TimeSlots
                .Where(s =>
                    s.ProviderId == providerId   &&
                    s.Date       == targetDate   &&
                    s.IsBooked   == false       &&
                    // Filter out past slots even if they are today
                    (s.Date > now.Date ||
                    (s.Date == now.Date && s.StartTime > now.TimeOfDay)))
                .OrderBy(s => s.StartTime)
                .Select(s => new
                {
                    s.Id,
                    s.Date,
                    StartTime = s.StartTime.ToString(@"hh\:mm"),
                    EndTime   = s.EndTime.ToString(@"hh\:mm")
                })
                .ToListAsync();

            return Ok(slots);
        }

        // POST api/slots/generate?providerId=3
        // Trigger slot generation manually (useful for testing)
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateSlots([FromQuery] int providerId)
        {
            await _slotGenerator.GenerateSlotsAsync(providerId, daysAhead: 7);
            return Ok(new { message = "Slots generated for next 7 days." });
        }
    }
}
