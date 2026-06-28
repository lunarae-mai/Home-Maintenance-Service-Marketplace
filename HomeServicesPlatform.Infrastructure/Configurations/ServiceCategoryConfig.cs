using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeServicesPlatform.Infrastructure.Configurations
{
    public class ServiceCategoryConfig : IEntityTypeConfiguration<ServiceCategory>
    {
        public void Configure(EntityTypeBuilder<ServiceCategory> builder)
        {
            // Configure Name as required with max length
            builder.Property(sc => sc.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            // Configure Description with max length
            builder.Property(sc => sc.Description)
                   .HasMaxLength(500);

            // Configure IsActive as required
            builder.Property(sc => sc.IsActive)
                   .IsRequired()
                   .HasDefaultValue(true);

            // Configure relationship with Services
            builder.HasMany(sc => sc.Services)
                   .WithOne(s => s.ServiceCategory)
                   .HasForeignKey(s => s.ServiceCategoryId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Create index on Name for faster lookups
            builder.HasIndex(sc => sc.Name);

            // Create index on IsActive for filtering active categories
            builder.HasIndex(sc => sc.IsActive);
        }
    }
}
