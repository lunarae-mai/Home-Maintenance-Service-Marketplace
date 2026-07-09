using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeServicesPlatform.Infrastructure.Configurations
{
    public class PaymentConfig : IEntityTypeConfiguration<Payment>
    {
        public void Configure(EntityTypeBuilder<Payment> builder)
        {
            // Configure Amount with decimal precision
            builder.Property(p => p.Amount)
                   .IsRequired()
                   .HasColumnType("decimal(18,2)");

            // Configure Commission with decimal precision
            builder.Property(p => p.Commission)
                   .IsRequired()
                   .HasColumnType("decimal(18,2)");

            // Configure PaymentMethod as required
            builder.Property(p => p.PaymentMethod)
                   .IsRequired()
                   .HasMaxLength(50);

            // Configure PaymentStatus as required
            builder.Property(p => p.PaymentStatus)
                   .IsRequired()
                   .HasMaxLength(50);

            // ProviderEarnings is a computed property (ignore in DB mapping)
            builder.Ignore(p => p.ProviderEarnings);

            // One-to-One relationship with Booking
            builder.HasOne(p => p.Booking)
                   .WithOne(b => b.Payment)
                   .HasForeignKey<Payment>(p => p.BookingId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Create index on BookingId
            builder.HasIndex(p => p.BookingId)
                   .IsUnique();

            // Create index on PaymentStatus for filtering
            builder.HasIndex(p => p.PaymentStatus);
        }
    }
}
