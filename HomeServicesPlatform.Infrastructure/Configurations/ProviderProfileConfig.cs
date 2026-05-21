using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeServicesPlatform.Infrastructure.Configurations
{
    public class ProviderProfileConfig : IEntityTypeConfiguration<ProviderProfile>
    {
        public void Configure(EntityTypeBuilder<ProviderProfile> builder)
        {
            // Set the decimal precision and scale for AvgRating (e.g., 4.50)
            builder.Property(p => p.AvgRating)
                   .HasColumnType("decimal(3,2)");

            // Configure the 1-to-1 relationship between ProviderProfile and User
            builder.HasOne(p => p.User)
                   .WithOne()
                   .HasForeignKey<ProviderProfile>(p => p.UserId);
        }
    }
}