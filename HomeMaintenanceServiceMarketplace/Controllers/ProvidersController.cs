using HomeServicesPlatform.Application.DTOs.Provider;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using static System.Net.Mime.MediaTypeNames;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProvidersController : ControllerBase
    {
        private readonly IProviderManagementService _providerService;

        public ProvidersController(IProviderManagementService providerService)
        {
            _providerService = providerService;
        }

       
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterProviderDto dto)
        {
            // Extract the UserId from their secure Token
            string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!;

            // Calling the Service logic by using the intrface 
            var result = await _providerService.RegisterProviderAsync(dto, userId);

            if (result)
            {
                return Ok(new { message = "Registration successful. Pending admin approval." }); 
            }

            return BadRequest(new { message = "Registration failed. Profile might already exist." }); 
        
        }

        
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {

            string userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value!;

            // Fetch the data from Service
            var profile = await _providerService.GetProviderProfileAsync(userId);

            if (profile == null)
            {
                return NotFound(new { message = "Profile not found for this user." });
            }

            return Ok(profile);
        }

        
        [HttpPut("status")]
        public async Task<IActionResult> UpdateStatus(int providerId, ProviderStatus status)
        { 
            var result = await _providerService.UpdateProviderStatusAsync(providerId, status);

            if (result) 
            {
                return Ok(new { message = $"The provider's account is now {status}." });
            }

            return BadRequest(new { message = "Failed to update status. Check if Provider ID is correct." });

        }

    } 
}
