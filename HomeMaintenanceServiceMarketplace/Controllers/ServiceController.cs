using HomeServicesPlatform.Application.DTOs.Common;
using HomeServicesPlatform.Application.DTOs.Service;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

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

        public ServiceController(IServiceService serviceService)
        {
            _serviceService = serviceService;
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
    }
}