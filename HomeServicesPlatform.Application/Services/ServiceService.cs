using HomeServicesPlatform.Application.DTOs.Service;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Application.Services
{
    public class ServiceService : IServiceService
    {
        private readonly IAppDbContext _context;

        public ServiceService(IAppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ServiceCategoryDto>> GetAllCategoriesAsync()
        {
            return await _context.ServiceCategories
                .Where(c => c.IsActive)
                .Select(c => new ServiceCategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<ServiceDto>> GetServicesByCategoryAsync(int categoryId)
        {
            return await _context.Services
                .Where(s => s.ServiceCategoryId == categoryId)
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Duration = s.Duration,
                    PriceModel = s.PriceModel,
                    ServiceCategoryId = s.ServiceCategoryId,
                    CategoryName = s.ServiceCategory.Name
                })
                .ToListAsync();
        }

        public async Task<ServiceDto?> GetServiceByIdAsync(int serviceId)
        {
            return await _context.Services
                .Where(s => s.Id == serviceId)
                .Select(s => new ServiceDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    Duration = s.Duration,
                    PriceModel = s.PriceModel,
                    ServiceCategoryId = s.ServiceCategoryId,
                    CategoryName = s.ServiceCategory.Name
                })
                .FirstOrDefaultAsync();
        }
    }
}