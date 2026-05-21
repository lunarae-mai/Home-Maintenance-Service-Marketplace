using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using HomeServicesPlatform.Domain.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IAppDbContext
    {
        DbSet<ProviderProfile> ProviderProfiles { get; }
        DbSet<ProviderService> ProviderServices { get; }

        // Method --> save info.
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
