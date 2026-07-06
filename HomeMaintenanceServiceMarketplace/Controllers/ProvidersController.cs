using HomeServicesPlatform.Application.DTOs.Common;
using HomeServicesPlatform.Application.DTOs.Provider;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        public ProvidersController(
            IProviderManagementService providerService,
            ICurrentUserService currentUserService)
        {
            _providerService = providerService;
            _currentUserService = currentUserService;
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
        /// Retrieves the authenticated provider's profile.
        /// </summary>
        /// <returns>The provider's profile information.</returns>
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
        /// Updates the approval status of a provider.
        /// </summary>
        /// <param name="providerId">The unique identifier of the provider.</param>
        /// <param name="status">The new provider status.</param>
        /// <returns>A confirmation that the provider status was updated.</returns>
        [HttpPut("status")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdateStatus(int providerId, ProviderStatus status)
        {
            var result = await _providerService.UpdateProviderStatusAsync(providerId, status);

            if (result)
            {
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = $"The provider's account is now {status}."
                });
            }

            return BadRequest(new ApiResponse<object>
            {
                Success = false,
                Message = "Failed to update provider status.",
                Errors = new List<string>
                {
                    "Check if the Provider ID is correct."
                }
            });
        }

        /// <summary>
        /// Searches service providers using filtering and pagination.
        /// </summary>
        /// <param name="filter">
        /// Search criteria including service ID, minimum rating, pricing type, page number, and page size.
        /// </param>
        /// <returns>A paginated list of providers matching the specified criteria.</returns>
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
    }
}