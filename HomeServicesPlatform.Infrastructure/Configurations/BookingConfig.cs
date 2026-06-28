using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeServicesPlatform.Infrastructure.Configurations
{
    public class BookingConfig : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            // Configure Status as required (stored as int in DB)
            builder.Property(b => b.Status)
                   .IsRequired()
                   .HasConversion<int>(); // Store enum as int

            // Configure Notes with max length
            builder.Property(b => b.Notes)
                   .HasMaxLength(1000);

            // Configure relationships (already in AppDbContext, but documented here)
            builder.HasOne(b => b.Customer)
                   .WithMany()
                   .HasForeignKey(b => b.CustomerId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Provider)
                   .WithMany()
                   .HasForeignKey(b => b.ProviderId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(b => b.Service)
                   .WithMany()
                   .HasForeignKey(b => b.ServiceId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(b => b.Slot)
                   .WithMany()
                   .HasForeignKey(b => b.SlotId)
                   .OnDelete(DeleteBehavior.Cascade);

            // One-to-One with Payment
            builder.HasOne(b => b.Payment)
                   .WithOne(p => p.Booking)
                   .HasForeignKey<Payment>(p => p.BookingId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Create index on CustomerId for faster customer booking lookups
            builder.HasIndex(b => b.CustomerId);

            // Create index on ProviderId for faster provider booking lookups
            builder.HasIndex(b => b.ProviderId);

            // Create index on Status for filtering bookings by status
            builder.HasIndex(b => b.Status);
        }
    }
}
