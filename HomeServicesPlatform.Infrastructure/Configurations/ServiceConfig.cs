using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeServicesPlatform.Infrastructure.Configurations
{
    public class ServiceConfig : IEntityTypeConfiguration<Service>
    {
        public void Configure(EntityTypeBuilder<Service> builder)
        {
            // Configure Name as required with max length
            builder.Property(s => s.Name)
                   .IsRequired()
                   .HasMaxLength(200);

            // Configure Duration as required
            builder.Property(s => s.Duration)
                   .IsRequired();

            // Configure PriceModel with max length
            builder.Property(s => s.PriceModel)
                   .IsRequired()
                   .HasMaxLength(50);

            // Configure relationship with ServiceCategory
            builder.HasOne(s => s.ServiceCategory)
                   .WithMany(sc => sc.Services)
                   .HasForeignKey(s => s.ServiceCategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Configure relationship with ProviderServices (many-to-many junction)
            builder.HasMany(s => s.ProviderServices)
                   .WithOne(ps => ps.Service)
                   .HasForeignKey(ps => ps.ServiceId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Create index on ServiceCategoryId for faster filtering
            builder.HasIndex(s => s.ServiceCategoryId);

            // Create index on Name for searching
            builder.HasIndex(s => s.Name);
        }
    }
}
