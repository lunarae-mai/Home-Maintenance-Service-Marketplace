using HomeServicesPlatform.Application.DTOs.Common;
using HomeServicesPlatform.Application.DTOs.Service;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Linq;

namespace HomeServicesPlatform.API.Controllers
{
    /// <summary>
    /// Provides endpoints for retrieving and searching home maintenance services.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _serviceService;
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ServiceController(
            IServiceService serviceService,
            IAppDbContext context,
            ICurrentUserService currentUserService)
        {
            _serviceService = serviceService;
            _context = context;
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Retrieves all available service categories.
        /// </summary>
        /// <returns>A list of service categories.</returns>
        [HttpGet("categories")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _serviceService.GetAllCategoriesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Service categories retrieved successfully.",
                Data = categories
            });
        }

        /// <summary>
        /// Retrieves all services belonging to a specific category.
        /// </summary>
        /// <param name="categoryId">The unique identifier of the service category.</param>
        /// <returns>A list of services in the selected category.</returns>
        [HttpGet("categories/{categoryId}/services")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetServicesByCategory(int categoryId)
        {
            var services = await _serviceService.GetServicesByCategoryAsync(categoryId);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Services retrieved successfully.",
                Data = services
            });
        }

        /// <summary>
        /// Retrieves detailed information about a specific service.
        /// </summary>
        /// <param name="serviceId">The unique identifier of the service.</param>
        /// <returns>The requested service.</returns>
        [HttpGet("{serviceId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetServiceById(int serviceId)
        {
            var service = await _serviceService.GetServiceByIdAsync(serviceId);

            if (service == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Service not found."
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Service retrieved successfully.",
                Data = service
            });
        }

        /// <summary>
        /// Searches services by name and category with pagination.
        /// </summary>
        /// <param name="filter">Search criteria including service name, category, page number, and page size.</param>
        /// <returns>A paginated list of matching services.</returns>
        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchServices([FromQuery] ServiceFilterDto filter)
        {
            var result = await _serviceService.SearchServicesAsync(filter);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Services retrieved successfully.",
                Data = result
            });
        }

        /// <summary>
        /// Updates a provider's service configuration base price and details.
        /// </summary>
        [HttpPut("edit")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> EditProviderService([FromBody] EditProviderServiceDto dto)
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

            var provider = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Provider profile not found."
                });
            }

            var providerService = await _context.ProviderServices
                .FirstOrDefaultAsync(ps => ps.ProviderId == provider.Id && ps.ServiceId == dto.ServiceId);

            if (providerService == null)
            {
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Service not found in provider profile."
                });
            }

            providerService.BasePrice = dto.BasePrice;
            providerService.PriceType = dto.Description ?? string.Empty;

            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Provider service updated successfully."
            });
        }
    }

    public class EditProviderServiceDto
    {
        public int ServiceId { get; set; }
        public decimal BasePrice { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}