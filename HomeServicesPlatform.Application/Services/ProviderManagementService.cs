using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Application.DTOs.Provider;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using HomeServicesPlatform.Application.DTOs.Common;


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

        public async Task<bool> AddProviderServiceAsync(string userId, ProviderServiceDto dto)
        {
            // Get provider profile for the current logged-in user
            var provider = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (provider == null)
                return false;

            // Prevent adding the same service twice
            var exists = await _context.ProviderServices.AnyAsync(ps =>
                ps.ProviderId == provider.Id &&
                ps.ServiceId == dto.ServiceId);

            if (exists)
                return false;

            var providerService = new ProviderService
            {
                ProviderId = provider.Id,
                ServiceId = dto.ServiceId,
                BasePrice = dto.BasePrice
            };

            _context.ProviderServices.Add(providerService);

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> UpdateProviderServiceAsync(string userId,int serviceId, UpdateProviderServiceDto dto)
        {
            // Get provider service for the current logged-in provider
            var providerService = await _context.ProviderServices
                .Include(ps => ps.Provider)
                .FirstOrDefaultAsync(ps =>
                    ps.Provider.UserId == userId &&
                    ps.ServiceId == serviceId);

            if (providerService == null)
                return false;

            // Update editable fields
            providerService.BasePrice = dto.BasePrice;
            providerService.PriceType = dto.PriceType;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteProviderServiceAsync(string userId,int serviceId)
        {
            // Get provider service for the current logged-in provider
            var providerService = await _context.ProviderServices
                .Include(ps => ps.Provider)
                .FirstOrDefaultAsync(ps =>
                    ps.Provider.UserId == userId &&
                    ps.ServiceId == serviceId);

            if (providerService == null)
                return false;

            // Remove the provider service
            _context.ProviderServices.Remove(providerService);

            return await _context.SaveChangesAsync() > 0;
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

        public async Task<RegisterProviderDto> GetProviderProfileAsync(string userId)
        {
            try
            {
                // Fetch profile and map its services
                var profile = await _context.ProviderProfiles
                    .Where(p => p.UserId == userId)
                    .Select(p => new RegisterProviderDto
                    {
                        Bio = p.Bio,
                        Experience = p.Experience,
                        // Select inner services and map to DTOs
                        Services = p.ProviderServices.Select(ps => new ProviderServiceDto
                        {
                            ServiceId = ps.ServiceId,
                            BasePrice = ps.BasePrice
                        }).ToList()
                    })
                    .FirstOrDefaultAsync(); 

                return profile;
            }
            catch (Exception ex)
            {
                // Log technical details if DB fails
                _logger.LogError(ex, "Error fetching profile for user {UserId}", userId);
                return null;
            }
        }

        public async Task<IEnumerable<ProviderProfile>> GetPendingProvidersAsync()
        {
            return await _context.ProviderProfiles
                .Where(p =>
                    p.Status == ProviderStatus.PendingApproval)
                .Include(p => p.ProviderServices)
                .ToListAsync();
        }

        public async Task<IEnumerable<ProviderSearchResultDto>> SearchProvidersByServiceAsync(int serviceId)
{
    return await _context.ProviderServices
        .Where(ps => ps.ServiceId == serviceId
                     && ps.Provider.IsApproved)
        .Select(ps => new ProviderSearchResultDto
        {
            ProviderId   = ps.ProviderId,
            ProviderName = ps.Provider.User.Name,
            Bio          = ps.Provider.Bio,
            Experience   = ps.Provider.Experience,
            AvgRating    = ps.Provider.AvgRating,
            BasePrice    = ps.BasePrice,
            PriceType    = ps.PriceType,
            ServiceName  = ps.Service.Name
        })
        .OrderByDescending(p => p.AvgRating)
        .ToListAsync();
}
      
        public async Task<PagedResultDto<ProviderSearchResultDto>> SearchProvidersAsync(ProviderFilterDto filter)
{
    
    // We query ProviderServices (the join table) because it links
    // a provider to a service along with their price info
    var query = _context.ProviderServices
        .Where(ps => ps.ServiceId == filter.ServiceId
                     && ps.Provider.IsApproved);  

   
    if (filter.MinRating.HasValue)
        query = query.Where(ps => ps.Provider.AvgRating >= filter.MinRating.Value);

    if (!string.IsNullOrEmpty(filter.PriceType))
        query = query.Where(ps => ps.PriceType == filter.PriceType);


  
    var totalCount = await query.CountAsync();

   
    var items = await query
        .OrderByDescending(ps => ps.Provider.AvgRating)
        .Skip((filter.Page - 1) * filter.PageSize)   // Skip pages before this one
        .Take(filter.PageSize)                         // Take only this page's records
        .Select(ps => new ProviderSearchResultDto
        {
            ProviderId   = ps.ProviderId,
            ProviderName = ps.Provider.User.Name,
            Bio          = ps.Provider.Bio,
            Experience   = ps.Provider.Experience,
            AvgRating    = ps.Provider.AvgRating,
            BasePrice    = ps.BasePrice,
            PriceType    = ps.PriceType,
            ServiceName  = ps.Service.Name
        })
        .ToListAsync();

    return new PagedResultDto<ProviderSearchResultDto>
    {
        Items      = items,
        TotalCount = totalCount,
        Page       = filter.Page,
        PageSize   = filter.PageSize
    };
}
    
    }
}
