using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ServiceController : ControllerBase
    {
        private readonly IServiceService _serviceService;

        public ServiceController(IServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        // GET api/service/categories — returns all active categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _serviceService.GetAllCategoriesAsync();
            return Ok(categories);
        }

        // GET api/service/categories/3/services — returns all services in that category
        [HttpGet("categories/{categoryId}/services")]
        public async Task<IActionResult> GetServicesByCategory(int categoryId)
        {
            var services = await _serviceService.GetServicesByCategoryAsync(categoryId);
            return Ok(services);
        }

        // GET api/service/5 — returns one specific service
        [HttpGet("{serviceId}")]
        public async Task<IActionResult> GetServiceById(int serviceId)
        {
            var service = await _serviceService.GetServiceByIdAsync(serviceId);
            if (service == null) return NotFound();
            return Ok(service);
        }
    }
}