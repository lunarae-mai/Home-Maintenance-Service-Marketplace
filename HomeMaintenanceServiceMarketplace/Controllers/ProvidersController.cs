using HomeServicesPlatform.Application.DTOs.Common;
using HomeServicesPlatform.Application.DTOs.Provider;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.API.Controllers
{
    /// <summary>
    /// Provides endpoints for provider registration, profile management, status updates, and provider search.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProvidersController : ControllerBase
    {
        private readonly IProviderManagementService _providerService;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAppDbContext _context;

        public ProvidersController(
            IProviderManagementService providerService,
            ICurrentUserService currentUserService,
            IAppDbContext context)
        {
            _providerService = providerService;
            _currentUserService = currentUserService;
            _context = context;
        }

        /// <summary>
        /// Registers the authenticated user as a service provider.
        /// </summary>
        /// <param name="dto">The provider registration information.</param>
        /// <returns>A confirmation that the registration request was submitted successfully.</returns>
        [HttpPost("register")]
        [Authorize(Roles = "Provider")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Register([FromBody] RegisterProviderDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });
            }

            var result = await _providerService.RegisterProviderAsync(dto, userId);

            if (result)
            {
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Registration successful. Pending admin approval."
                });
            }

            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Registration failed.",
                Errors = new List<string>
                {
                    "Profile might already exist."
                }
            });
        }

        /// <summary>
        /// Adds a new service for the authenticated provider.
        /// </summary>
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


        /// <summary>
        /// Updates the authenticated provider's service.
        /// </summary>
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


        /// <summary>
        /// Deletes one of the authenticated provider's services.
        /// </summary>
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



        /// <summary>
        /// Retrieves the authenticated provider's profile.
        /// </summary>
        [HttpGet("profile")]
        [Authorize(Roles = "Provider")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetProfile()
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });
            }

            var profile = await _providerService.GetProviderProfileAsync(userId);

            if (profile == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Profile not found."
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Provider profile retrieved successfully.",
                Data = profile
            });
        }



        /// <summary>
        /// Searches service providers using filtering and pagination.
        /// </summary>
        /// <param name="filter">
        /// Search criteria including service ID, minimum rating,
        /// pricing type, page number, and page size.
        /// </param>
        /// <returns>
        /// A paginated list of providers matching the specified criteria.
        /// </returns>
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Search([FromQuery] ProviderFilterDto filter)
        {
            if (filter.ServiceId <= 0)
            {
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid search criteria.",
                    Errors = new List<string>
                    {
                        "A valid ServiceId is required."
                    }
                });
            }

            var result = await _providerService.SearchProvidersAsync(filter);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Providers retrieved successfully.",
                Data = result
            });
        }

        /// <summary>
        /// Updates the authenticated provider's name and bio.
        /// </summary>
        [HttpPut("profile")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProviderProfileDto dto)
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });
            }

            // 1. Update User Name
            var user = await _context.ApplicationUsers.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "User not found."
                });
            }
            user.Name = dto.Name;

            // 2. Update Provider Profile Bio
            var profile = await _context.ProviderProfiles.FirstOrDefaultAsync(p => p.UserId == userId);
            if (profile != null)
            {
                profile.Bio = dto.Bio;
            }

            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Profile updated successfully."
            });
        }
    }

    public class UpdateProviderProfileDto
    {
        public string Name { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
    }
}