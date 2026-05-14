using HomeMaintenanceServiceMarketplace.Models;
using HomeServicesPlatform.Application.DTOs.Provider;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.Services
{
    public class ProviderManagementService : IProviderManagementService
    {

        private readonly IAppDbContext _context;
        private readonly ILogger<ProviderManagementService> _logger;

        // Dependency Injection
        public ProviderManagementService(IAppDbContext context, ILogger<ProviderManagementService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> RegisterProviderAsync(RegisterProviderDto dto, string userId)
        {
            try
            {
                // create profile object and Manual Mapping from DTO to Entity
                var profile = new ProviderProfile
                {
                    UserId = userId,
                    Bio = dto.Bio,
                    Experience = dto.Experience,
                    Status = ProviderStatus.PendingApproval,
                    IsApproved = false 
                };

                // Add profile to context
                _context.ProviderProfiles.Add(profile);


                //  Add provider services to table  
                if (dto.Services != null && dto.Services.Any())
                {
                    foreach (var s in dto.Services)
                    {
                        var providerService = new ProviderService
                        {
                            Provider = profile,
                            ServiceId = s.ServiceId,
                            BasePrice = s.BasePrice
                        };

                        // add services to context
                        _context.ProviderServices.Add(providerService);
                    }
                }

                // save all provider info. in db as one Transaction
                return await _context.SaveChangesAsync() > 0;

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering provider for User: {UserId}", userId);
                throw;
            }
        }

        public async Task<bool> UpdateProviderStatusAsync(int providerId, ProviderStatus status)
        {
            try
            { 
                var provider = await _context.ProviderProfiles.FindAsync(providerId);

                if (provider == null) return false;

                provider.Status = status;

                // Quick Check --> IsApproved boolean based on the status
                provider.IsApproved = (status == ProviderStatus.Approved);

                return await _context.SaveChangesAsync() > 0;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating status for Provider: {ProviderId}", providerId);
                return false;
            }
        }

        public Task<RegisterProviderDto> GetProviderProfileAsync(string userId)
        {
            // This will be implemented when needed for viewing the profile
            throw new NotImplementedException();
        }


    }
}
