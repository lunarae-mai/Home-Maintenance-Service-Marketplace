using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeServicesPlatform.Infrastructure.Configurations
{
    public class TimeSlotConfig : IEntityTypeConfiguration<TimeSlot>
    {
        public void Configure(EntityTypeBuilder<TimeSlot> builder)
        {
            builder.HasIndex(t => new { t.ProviderId, t.Date, t.StartTime })
                   .IsUnique();

// Concurrency token / slot engine/ s3
            builder.Property(t => t.RowVersion)
                    .IsRowVersion()
                    .IsConcurrencyToken();
        }
    }
}