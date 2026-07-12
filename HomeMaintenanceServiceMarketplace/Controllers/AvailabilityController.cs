using HomeServicesPlatform.Application.DTOs.Availability;
using HomeServicesPlatform.Application.DTOs.Common;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AvailabilityController : ControllerBase
    {
        private readonly IAvailabilityService _availabilityService;
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public AvailabilityController(
            IAvailabilityService availabilityService,
            IAppDbContext context,
            ICurrentUserService currentUserService)
        {
            _availabilityService = availabilityService;
            _context = context;
            _currentUserService = currentUserService;
        }

        [HttpPost("slots")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> SetAvailabilitySlots([FromBody] SetAvailabilityDto dto)
        {
            var providerId = await GetCurrentProviderIdAsync();
            if (providerId == null)
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized: No provider profile found for this user."
                });
            }

            // 1. Save weekly availability schedule
            await _availabilityService.SetWeeklyAvailabilityAsync(providerId.Value, dto);

            // 2. Generate hourly time slots for the next 7 days immediately
            await _availabilityService.GenerateSlotsAsync(providerId.Value, DateTime.Today, 7);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Availability working schedule updated and booking slots published successfully."
            });
        }

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
