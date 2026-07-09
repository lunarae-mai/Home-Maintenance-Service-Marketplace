using HomeServicesPlatform.Domain.Models; 
using Microsoft.EntityFrameworkCore;
using HomeServicesPlatform.Application.Interfaces;

namespace HomeServicesPlatform.Infrastructure.Data
{
    public class AppDbContext : DbContext, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<ApplicationUser> ApplicationUsers { get; set; }
        public DbSet<ProviderProfile> ProviderProfiles { get; set; }
        public DbSet<ServiceCategory> ServiceCategories { get; set; }
        public DbSet<Service> Services { get; set; }
        public DbSet<ProviderService> ProviderServices { get; set; }
        public DbSet<ProviderAvailability> ProviderAvailabilities { get; set; }
        public DbSet<TimeSlot> TimeSlots { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Payment)
                .WithOne(p => p.Booking)
                .HasForeignKey<Payment>("BookingId");

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Provider)
                .WithMany() 
                .HasForeignKey(b => b.ProviderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.Customer)
                .WithMany()
                .HasForeignKey(b => b.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                 .HasOne(r => r.Reviewer) 
                 .WithMany()
                 .HasForeignKey(r => r.ReviewerId)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewee) 
                .WithMany()
                .HasForeignKey(r => r.RevieweeId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}