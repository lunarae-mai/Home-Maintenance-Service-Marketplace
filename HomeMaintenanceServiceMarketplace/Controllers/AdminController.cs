using HomeServicesPlatform.Application.DTOs.Auth;
using HomeServicesPlatform.Application.DTOs.Common;

using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]

    public class AdminController : ControllerBase
    {
        private readonly IProviderManagementService _providerService;

        public AdminController(IProviderManagementService providerManagementService)
        {
            _providerService = providerManagementService;
        }

        [HttpGet("providers/pending")]
        public async Task<IActionResult> GetPendingProviders()
        {
            var providers =
                await _providerService.GetPendingProvidersAsync();

           return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Pending providers retrieved successfully.",
                Data = providers
            });
        }


        [HttpPut("providers/status")]
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

        [HttpPut("providers/{providerId}/approve")]
        public async Task<IActionResult> ApproveProvider(int providerId)
        {
            var result =
                await _providerService.UpdateProviderStatusAsync(
                    providerId,
                    ProviderStatus.Approved);

              if (!result)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Provider not found."
                });
            }
            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Provider approved successfully."
            });
        }

        [HttpPut("providers/{providerId}/reject")]
        public async Task<IActionResult> RejectProvider(int providerId)
        {
            var result =
                await _providerService.UpdateProviderStatusAsync(
                    providerId,
                    ProviderStatus.Rejected);

            if (!result)
                 return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Provider not found."
                });

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Provider rejected successfully."
            });
        }
    }
}
