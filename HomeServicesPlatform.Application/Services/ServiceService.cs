using HomeServicesPlatform.Application.DTOs.Service;
using HomeServicesPlatform.Application.DTOs.Common;

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
                    CategoryName = s.ServiceCategory.Name,
                    Description = s.ServiceCategory.Description
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
                    CategoryName = s.ServiceCategory.Name,
                    Description = s.ServiceCategory.Description
                })
                .FirstOrDefaultAsync();
        }
     public async Task<PagedResultDto<ServiceDto>> SearchServicesAsync(ServiceFilterDto filter)
{
    var query = _context.Services.AsQueryable();

    if (!string.IsNullOrWhiteSpace(filter.Search))
    {
        query = query.Where(s =>
            s.Name.Contains(filter.Search));
    }

    if (filter.CategoryId.HasValue)
    {
        query = query.Where(s =>
            s.ServiceCategoryId == filter.CategoryId.Value);
    }

    var totalCount = await query.CountAsync();

    var items = await query
        .OrderBy(s => s.Name)
        .Skip((filter.Page - 1) * filter.PageSize)
        .Take(filter.PageSize)
        .Select(s => new ServiceDto
        {
            Id = s.Id,
            Name = s.Name,
            Duration = s.Duration,
            PriceModel = s.PriceModel,
            ServiceCategoryId = s.ServiceCategoryId,
            CategoryName = s.ServiceCategory.Name,
            Description = s.ServiceCategory.Description
        })
        .ToListAsync();

    return new PagedResultDto<ServiceDto>
    {
        Items = items,
        TotalCount = totalCount,
        Page = filter.Page,
        PageSize = filter.PageSize
    };
}
    }
}