using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Application.DTOs.Service;

using Microsoft.AspNetCore.Mvc;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceController : ControllerBase
    {/// <summary>
/// Provides endpoints for retrieving and searching home maintenance services.
/// </summary>
        private readonly IServiceService _serviceService;

        public ServiceController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }
/// <summary>
/// Retrieves all available service categories.
/// </summary>
/// <returns>A list of service categories.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]

        // GET api/service/categories — returns all active categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _serviceService.GetAllCategoriesAsync();
            return Ok(categories);
        }


<<<<<<< Updated upstream
=======
/// <summary>
/// Retrieves all services belonging to a specific category.
/// </summary>
/// <param name="categoryId">The unique identifier of the service category.</param>
/// <returns>A list of services in the selected category.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
>>>>>>> Stashed changes
        // GET api/service/categories/3/services — returns all services in that category
        [HttpGet("categories/{categoryId}/services")]
        public async Task<IActionResult> GetServicesByCategory(int categoryId)
        {
            var services = await _serviceService.GetServicesByCategoryAsync(categoryId);
            return Ok(services);
        }


<<<<<<< Updated upstream
=======
/// <summary>
/// Retrieves detailed information about a specific service.
/// </summary>
/// <param name="serviceId">The unique identifier of the service.</param>
/// <returns>The requested service.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
>>>>>>> Stashed changes
        // GET api/service/5 — returns one specific service
        [HttpGet("{serviceId}")]
        public async Task<IActionResult> GetServiceById(int serviceId)
        {
            var service = await _serviceService.GetServiceByIdAsync(serviceId);
            if (service == null) return NotFound();
            return Ok(service);
        }
<<<<<<< Updated upstream
=======
        /// <summary>
/// Searches services by name and category with pagination.
/// </summary>
/// <param name="filter">Search criteria including service name, category, page number, and page size.</param>
/// <returns>A paginated list of matching services.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet("search")]
    public async Task<IActionResult> SearchServices(
        [FromQuery] ServiceFilterDto filter)
    {
        var result = await _serviceService.SearchServicesAsync(filter);

        return Ok(result);
    }
    
>>>>>>> Stashed changes
    }
}