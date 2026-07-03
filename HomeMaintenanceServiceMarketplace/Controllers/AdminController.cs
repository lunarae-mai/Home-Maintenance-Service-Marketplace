using HomeServicesPlatform.Application.DTOs.Auth;
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

            return Ok(providers);
        }

        [HttpPut("providers/{providerId}/approve")]
        public async Task<IActionResult> ApproveProvider(int providerId)
        {
            var result =
                await _providerService.UpdateProviderStatusAsync(
                    providerId,
                    ProviderStatus.Approved);

            if (!result)
                return NotFound();

            return Ok(new
            {
                message = "Provider approved successfully."
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
                return NotFound();

            return Ok(new
            {
                message = "Provider rejected successfully."
            });
        }
    }
}
