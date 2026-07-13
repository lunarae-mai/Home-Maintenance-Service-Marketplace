using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeServicesPlatform.Infrastructure.Configurations
{
    public class ApplicationUserConfig : IEntityTypeConfiguration<ApplicationUser>
    {
        public void Configure(EntityTypeBuilder<ApplicationUser> builder)
        {
            // Set primary key
            builder.HasKey(u => u.Id);

            // Configure Email as required with max length
            builder.Property(u => u.Email)
                   .IsRequired()
                   .HasMaxLength(256);

            // Configure Name as required with max length
            builder.Property(u => u.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            // Configure Phone with max length
            builder.Property(u => u.Phone)
                   .HasMaxLength(20);

            // Configure Role as required
            builder.Property(u => u.Role)
                   .IsRequired()
                   .HasMaxLength(50);

            // Configure PasswordHash as required
            builder.Property(u => u.PasswordHash)
                   .IsRequired();

           // Configure ProfileImageUrl
              builder.Property(u => u.ProfileImageUrl)
                     .HasMaxLength(500);

           // Configure RefreshToken
              builder.Property(u => u.RefreshToken)
                     .HasMaxLength(500);

            // Create index on Email for faster lookups
            builder.HasIndex(u => u.Email);
        }
    }
}
