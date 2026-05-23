using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IAppDbContext
    {
        DbSet<ApplicationUser> ApplicationUsers { get; }
        DbSet<ProviderProfile> ProviderProfiles { get; }
        DbSet<ProviderService> ProviderServices { get; }
        DbSet<Service> Services { get; }
        DbSet<ServiceCategory> ServiceCategories { get; }

        DbSet<Booking> Bookings { get; }
        DbSet<Payment> Payments { get; }
        DbSet<Review> Reviews { get; }
        DbSet<ProviderAvailability> ProviderAvailabilities { get; }
        DbSet<TimeSlot> TimeSlots { get; }

        // Method --> save info.
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
