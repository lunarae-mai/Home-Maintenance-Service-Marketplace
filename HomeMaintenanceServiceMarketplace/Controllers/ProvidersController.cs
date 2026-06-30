using HomeServicesPlatform.Application.DTOs.Provider;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProvidersController : ControllerBase
    {/// <summary>
/// Provides endpoints for provider registration and provider search.
/// </summary>
        private readonly IProviderManagementService _providerService;
        private readonly ICurrentUserService _currentUserService;

        public ProvidersController(IProviderManagementService providerService, ICurrentUserService currentUserService)
        {
            _providerService = providerService;
            _currentUserService = currentUserService;
        }
<<<<<<< Updated upstream

       
=======
/// <summary>
/// Registers the authenticated user as a service provider.
/// </summary>
/// <param name="dto">The provider registration information.</param>
/// <returns>The registered provider profile.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]

>>>>>>> Stashed changes
        [HttpPost("register")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> Register([FromBody] RegisterProviderDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _providerService.RegisterProviderAsync(dto, userId);

            if (result)
            {
                return Ok(new { message = "Registration successful. Pending admin approval." }); 
            }

            return BadRequest(new { message = "Registration failed. Profile might already exist." }); 
        
        }
/// <summary>
/// Searches service providers using filtering and pagination.
/// </summary>
/// <param name="filter">Provider search criteria including service, rating, pricing type, page number, and page size.</param>
/// <returns>A paginated list of matching providers.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
        
        [HttpGet("profile")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> GetProfile()
        {

            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Fetch the data from Service
            var profile = await _providerService.GetProviderProfileAsync(userId);

            if (profile == null)
            {
                return NotFound(new { message = "Profile not found for this user." });
            }

            return Ok(profile);
        }

        
        [HttpPut("status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int providerId, ProviderStatus status)
        { 
            var result = await _providerService.UpdateProviderStatusAsync(providerId, status);

            if (result) 
            {
                return Ok(new { message = $"The provider's account is now {status}." });
            }

            return BadRequest(new { message = "Failed to update status. Check if Provider ID is correct." });

        }
<<<<<<< Updated upstream
        // GET api/providers/search?serviceId=2
    // GET api/providers/search?serviceId=2&minRating=4&priceType=Fixed&page=1&pageSize=10
=======
        /// <summary>
/// Searches service providers using filtering and pagination.
/// </summary>
/// <param name="filter">Filtering options including service, minimum rating, pricing type, page number, and page size.</param>
/// <returns>A paginated list of matching providers.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
>>>>>>> Stashed changes
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] ProviderFilterDto filter)
        {
            if (filter.ServiceId <= 0)
                return BadRequest(new { message = "A valid serviceId is required." });

            var result = await _providerService.SearchProvidersAsync(filter);
            return Ok(result);
        }

    } 
}
