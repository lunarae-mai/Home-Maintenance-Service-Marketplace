using HomeServicesPlatform.Application.DTOs.Availability;
using HomeServicesPlatform.Application.DTOs.Common;
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

        // PUT api/slots/availability
        [HttpPut("availability")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> SetAvailability([FromBody] SetAvailabilityDto dto)
        {
            var providerId = await GetCurrentProviderIdAsync();

            if (providerId == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized.",
                    Errors = new List<string>
                    {
                        "No provider profile found for this user."
                    }
                });
            }

            try
            {
                var result = await _availabilityService.SetWeeklyAvailabilityAsync(providerId.Value, dto);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Availability updated successfully.",
                    Data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Failed to update availability.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET api/slots/availability
        [HttpGet("availability")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> GetAvailability()
        {
            var providerId = await GetCurrentProviderIdAsync();

            if (providerId == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized.",
                    Errors = new List<string>
                    {
                        "No provider profile found for this user."
                    }
                });
            }

            var result = await _availabilityService.GetWeeklyAvailabilityAsync(providerId.Value);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Availability retrieved successfully.",
                Data = result
            });
        }

        // POST api/slots/generate
        [HttpPost("generate")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> GenerateSlots([FromQuery] int daysAhead = 7)
        {
            var providerId = await GetCurrentProviderIdAsync();

            if (providerId == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized.",
                    Errors = new List<string>
                    {
                        "No provider profile found for this user."
                    }
                });
            }

            try
            {
                var result = await _availabilityService.GenerateSlotsAsync(
                    providerId.Value,
                    DateTime.Today,
                    daysAhead);

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Time slots generated successfully.",
                    Data = result
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Failed to generate time slots.",
                    Errors = new List<string> { ex.Message }
                });
            }
        }

        // GET api/slots/{providerId}?date=2026-07-01
        [HttpGet("{providerId:int}")]
        public async Task<IActionResult> GetFreeSlots(int providerId, [FromQuery] DateTime date)
        {
            var now = DateTime.Now;

            var freeSlots = await _context.TimeSlots
                .Where(s => s.ProviderId == providerId
                         && s.Date.Date == date.Date
                         && !s.IsBooked
                         && (s.Date.Date > now.Date || s.StartTime > now.TimeOfDay))
                .OrderBy(s => s.StartTime)
                .Select(s => new TimeSlotDto
                {
                    Id = s.Id,
                    Date = s.Date,
                    StartTime = s.StartTime,
                    EndTime = s.EndTime
                })
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Available time slots retrieved successfully.",
                Data = freeSlots
            });
        }

        // Helper
        private async Task<int?> GetCurrentProviderIdAsync()
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return null;

            var profile = await _context.ProviderProfiles
                .Where(p => p.UserId == userId)
                .Select(p => new { p.Id })
                .FirstOrDefaultAsync();

            return profile?.Id;
        }
    }
}