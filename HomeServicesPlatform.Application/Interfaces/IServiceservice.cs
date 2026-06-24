using HomeServicesPlatform.Application.DTOs.Service;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceCategoryDto>> GetAllCategoriesAsync();
        Task<IEnumerable<ServiceDto>> GetServicesByCategoryAsync(int categoryId);
        Task<ServiceDto?> GetServiceByIdAsync(int serviceId);
    }
}