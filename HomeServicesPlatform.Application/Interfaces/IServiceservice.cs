using HomeServicesPlatform.Application.DTOs.Service;
using HomeServicesPlatform.Application.DTOs.Common;
namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceCategoryDto>> GetAllCategoriesAsync();
        Task<IEnumerable<ServiceDto>> GetServicesByCategoryAsync(int categoryId);
        Task<ServiceDto?> GetServiceByIdAsync(int serviceId);
        Task<PagedResultDto<ServiceDto>> SearchServicesAsync(ServiceFilterDto filter);
    }
}