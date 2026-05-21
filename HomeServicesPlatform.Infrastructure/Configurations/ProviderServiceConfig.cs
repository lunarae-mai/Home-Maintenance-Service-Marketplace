using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeServicesPlatform.Infrastructure.Configurations
{
    public class ProviderServiceConfig : IEntityTypeConfiguration<ProviderService>
    {
        public void Configure(EntityTypeBuilder<ProviderService> builder)
        {
            builder.Property(ps => ps.BasePrice)
                   .HasColumnType("decimal(18,2)");
        }
    }
}