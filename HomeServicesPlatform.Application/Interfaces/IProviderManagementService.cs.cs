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

        // Method --> Get pending profiles info.
        Task<IEnumerable<ProviderProfile>> GetPendingProvidersAsync();

        Task<PagedResultDto<ProviderSearchResultDto>> SearchProvidersAsync(ProviderFilterDto filter);    }
}
