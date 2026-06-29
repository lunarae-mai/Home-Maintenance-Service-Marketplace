using HomeServicesPlatform.Application.DTOs.Availability;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SlotsController : ControllerBase
    {
        private readonly IAvailabilityService _availabilityService;
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public SlotsController(
            IAvailabilityService availabilityService,
            IAppDbContext context,
            ICurrentUserService currentUserService)
        {
            _availabilityService = availabilityService;
            _context = context;
            _currentUserService = currentUserService;
        }

        // PUT api/slots/availability  -> provider sets their weekly working hours
        [HttpPut("availability")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> SetAvailability([FromBody] SetAvailabilityDto dto)
        {
            var providerId = await GetCurrentProviderIdAsync();
            if (providerId == null)
                return Unauthorized(new { message = "No provider profile found for this user." });

            try
            {
                var result = await _availabilityService.SetWeeklyAvailabilityAsync(providerId.Value, dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // GET api/slots/availability -> provider views their own weekly schedule
        [HttpGet("availability")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> GetAvailability()
        {
            var providerId = await GetCurrentProviderIdAsync();
            if (providerId == null)
                return Unauthorized(new { message = "No provider profile found for this user." });

            var result = await _availabilityService.GetWeeklyAvailabilityAsync(providerId.Value);
            return Ok(result);
        }

        // POST api/slots/generate -> provider triggers slot generation manually (Sprint 1 version)
        [HttpPost("generate")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> GenerateSlots([FromQuery] int daysAhead = 7)
        {
            var providerId = await GetCurrentProviderIdAsync();
            if (providerId == null)
                return Unauthorized(new { message = "No provider profile found for this user." });

            try
            {
                var result = await _availabilityService.GenerateSlotsAsync(providerId.Value, DateTime.Today, daysAhead);
                return Ok(result);
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // GET api/slots/{providerId}?date=2026-07-01 -> customers browse free slots for a date
        [HttpGet("{providerId:int}")]
        public async Task<IActionResult> GetFreeSlots(int providerId, [FromQuery] DateTime date)
        {
            var freeSlots = await _context.TimeSlots
                .Where(s => s.ProviderId == providerId
                         && s.Date.Date == date.Date
                         && !s.IsBooked)
                .OrderBy(s => s.StartTime)
                .Select(s => new TimeSlotDto
                {
                    Id = s.Id,
                    ProviderId = s.ProviderId,
                    Date = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime,
                    IsBooked = s.IsBooked
                })
                .ToListAsync();

            return Ok(freeSlots);
        }

        // Helper: resolve the logged-in provider's ProviderId from their UserId
        private async Task<int?> GetCurrentProviderIdAsync()
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId)) return null;

            var profile = await _context.ProviderProfiles
                .Where(p => p.UserId == userId)
                .Select(p => new { p.Id })
                .FirstOrDefaultAsync();

            return profile?.Id;
        }
    }
}