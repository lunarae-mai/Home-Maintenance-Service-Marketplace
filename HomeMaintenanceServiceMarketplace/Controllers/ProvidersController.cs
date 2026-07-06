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
    {
        private readonly IProviderManagementService _providerService;
        private readonly ICurrentUserService _currentUserService;

        public ProvidersController(IProviderManagementService providerService, ICurrentUserService currentUserService)
        {
            _providerService = providerService;
            _currentUserService = currentUserService;
        }


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


        [HttpPost("services")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> AddService([FromBody] ProviderServiceDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _providerService.AddProviderServiceAsync(userId, dto);

            if (!result)
                return BadRequest(new { message = "Failed to add service." });

            return Ok(new { message = "Service added successfully." });
        }


        [HttpPut("services/{serviceId}")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> UpdateService(int serviceId,[FromBody] UpdateProviderServiceDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _providerService.UpdateProviderServiceAsync(userId,serviceId,dto);

            if (!result)
            {
                return BadRequest(new { message = "Failed to update service."});
            }

            return Ok(new { message = "Service updated successfully." });
        }


        [HttpDelete("services/{serviceId}")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> DeleteService(int serviceId)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var result = await _providerService.DeleteProviderServiceAsync(userId,serviceId);

            if (!result)
            {
                return BadRequest(new { message = "Failed to delete service." });
            }

            return Ok(new { message = "Service deleted successfully." });
        }


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
