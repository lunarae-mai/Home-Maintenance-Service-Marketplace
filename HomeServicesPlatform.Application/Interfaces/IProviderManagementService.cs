using HomeServicesPlatform.Application.DTOs.Common;
using HomeServicesPlatform.Application.DTOs.Provider;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IProviderManagementService
    {
        // Method --> Provider register at first time 
        Task<bool> RegisterProviderAsync(RegisterProviderDto dto, string userId);

        // Method --> Admin approve or reject
        Task<bool> UpdateProviderStatusAsync(int providerId, ProviderStatus status);

        // Method --> Get provider profile info. 
        Task<RegisterProviderDto> GetProviderProfileAsync(string userId);

        // Method --> Add new service after provider registration
        Task<bool> AddProviderServiceAsync(string userId, ProviderServiceDto dto);
       
        // Method --> Update provider service details
        Task<bool> UpdateProviderServiceAsync(string userId, int serviceId, UpdateProviderServiceDto dto);

        // Method --> Delete provider service
        Task<bool> DeleteProviderServiceAsync(string userId, int serviceId);
    
        // Method --> Get pending profiles info.
        Task<IEnumerable<ProviderProfile>> GetPendingProvidersAsync();

        // Method --> Search providers with filters and pagination
        Task<PagedResultDto<ProviderSearchResultDto>> SearchProvidersAsync(ProviderFilterDto filter); 
    
    }
}
