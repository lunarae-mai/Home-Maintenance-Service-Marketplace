using HomeServicesPlatform.Application.DTOs.Auth;
using HomeServicesPlatform.Application.DTOs.Common;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]

    public class AdminController : ControllerBase
    {
        private readonly IProviderManagementService _providerService;
        private readonly IAppDbContext _context;

        public AdminController(IProviderManagementService providerManagementService, IAppDbContext context)
        {
            _providerService = providerManagementService;
            _context = context;
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

        [HttpGet("metrics")]
        public async Task<IActionResult> GetDashboardMetrics()
        {
            var totalBookings = await _context.Bookings.CountAsync();
            var customerBase = await _context.ApplicationUsers.CountAsync(u => u.Role == "Customer");
            var totalTransactions = await _context.Payments
                .Where(p => p.PaymentStatus == "Paid")
                .SumAsync(p => p.Amount);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Dashboard metrics retrieved successfully.",
                Data = new
                {
                    TotalBookings = totalBookings,
                    CustomerBase = customerBase,
                    TransactionVolume = totalTransactions,
                    SystemLatency = 184
                }
            });
        }

        [HttpGet("providers")]
        public async Task<IActionResult> GetAllProviders()
        {
            var providers = await _context.ProviderProfiles
                .Include(p => p.User)
                .Include(p => p.ProviderServices)
                    .ThenInclude(ps => ps.Service)
                .Select(p => new
                {
                    ProviderId = p.Id,
                    UserId = p.UserId,
                    ProviderName = p.User.Name,
                    Email = p.User.Email,
                    Phone = p.User.Phone,
                    Bio = p.Bio,
                    Experience = p.Experience,
                    Status = p.Status.ToString(),
                    AvgRating = p.AvgRating,
                    OfferedServices = p.ProviderServices.Select(ps => ps.Service.Name).ToList()
                })
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "All providers retrieved successfully.",
                Data = providers
            });
        }

        [HttpGet("providers/{providerId}")]
        public async Task<IActionResult> GetProviderDetails(int providerId)
        {
            var provider = await _context.ProviderProfiles
                .Include(p => p.User)
                .Include(p => p.ProviderServices)
                    .ThenInclude(ps => ps.Service)
                .FirstOrDefaultAsync(p => p.Id == providerId);

            if (provider == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Provider not found."
                });
            }

            var reviews = await _context.Reviews
                .Where(r => r.RevieweeId == provider.UserId && r.ReviewerType == "Customer")
                .Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    ReviewerName = r.Reviewer.Name,
                    r.CreatedAt
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Provider details retrieved successfully.",
                Data = new
                {
                    ProviderId = provider.Id,
                    ProviderName = provider.User.Name,
                    Email = provider.User.Email,
                    Phone = provider.User.Phone,
                    Bio = provider.Bio,
                    Experience = provider.Experience,
                    Status = provider.Status.ToString(),
                    AvgRating = provider.AvgRating,
                    OfferedServices = provider.ProviderServices.Select(ps => new {
                        ServiceId = ps.ServiceId,
                        ServiceName = ps.Service.Name,
                        BasePrice = ps.BasePrice,
                        PriceType = ps.PriceType
                    }).ToList(),
                    Reviews = reviews
                }
            });
        }
    }
}
