using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AvailabilityController : ControllerBase
    {
        private readonly IAppDbContext _context;

        public AvailabilityController(IAppDbContext context)
        {
            _context = context;
        }

        // POST api/availability  → provider sets a working day/time
        [HttpPost]
        public async Task<IActionResult> SetAvailability(
            [FromBody] SetAvailabilityDto dto)
        {
            // Get the logged-in user's ID from their JWT token
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            // Find the provider profile that belongs to this user
            var provider = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null)
                return NotFound(new { message = "Provider profile not found." });

            // Check: does this day already have an availability record?
            var existing = await _context.ProviderAvailabilities
                .FirstOrDefaultAsync(a =>
                    a.ProviderId == provider.Id &&
                    a.DayOfWeek == dto.DayOfWeek);

            if (existing != null)
            {
                // Update existing record
                existing.StartTime = TimeSpan.Parse(dto.StartTime);
                existing.EndTime   = TimeSpan.Parse(dto.EndTime);
                existing.IsAvailable = dto.IsAvailable;
            }
            else
            {
                // Create a brand new availability record
                var availability = new ProviderAvailability
                {
                    ProviderId  = provider.Id,
                    DayOfWeek   = dto.DayOfWeek,
                    StartTime   = TimeSpan.Parse(dto.StartTime),
                    EndTime     = TimeSpan.Parse(dto.EndTime),
                    IsAvailable = dto.IsAvailable
                };
                _context.ProviderAvailabilities.Add(availability);
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Availability saved successfully." });
        }

        // GET api/availability  → provider views their own schedule
        [HttpGet]
        public async Task<IActionResult> GetMyAvailability()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var provider = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null)
                return NotFound();

            var schedule = await _context.ProviderAvailabilities
                .Where(a => a.ProviderId == provider.Id)
                .Select(a => new {
                    a.DayOfWeek,
                    StartTime = a.StartTime.ToString(),
                    EndTime   = a.EndTime.ToString(),
                    a.IsAvailable
                })
                .ToListAsync();

            return Ok(schedule);
        }
    }
}
