using HomeServicesPlatform.Application.DTOs.Provider;
using HomeServicesPlatform.Domain.Enums;
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
 Task<PagedResultDto<ProviderSearchResultDto>> SearchProvidersAsync(ProviderFilterDto filter);    }
}
