using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeServicesPlatform.Infrastructure.Configurations
{
    public class ReviewConfig : IEntityTypeConfiguration<Review>
    {
        public void Configure(EntityTypeBuilder<Review> builder)
        {
            // Configure Rating with range validation (1-5)
            builder.Property(r => r.Rating)
                   .IsRequired();

            // Configure ReviewerType as required
            builder.Property(r => r.ReviewerType)
                   .IsRequired()
                   .HasMaxLength(50);

            // Configure Comment with max length
            builder.Property(r => r.Comment)
                   .HasMaxLength(1000);

            // Configure relationship with Reviewer (ApplicationUser)
            builder.HasOne(r => r.Reviewer)
                   .WithMany()
                   .HasForeignKey(r => r.ReviewerId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Configure relationship with Reviewee (ApplicationUser)
            builder.HasOne(r => r.Reviewee)
                   .WithMany()
                   .HasForeignKey(r => r.RevieweeId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Configure relationship with Booking
            builder.HasOne(r => r.Booking)
                   .WithMany()
                   .HasForeignKey(r => r.BookingId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Create index on BookingId for faster booking review lookups
            builder.HasIndex(r => r.BookingId);

            // Create index on ReviewerId for faster reviewer history lookups
            builder.HasIndex(r => r.ReviewerId);

            // Create index on RevieweeId for faster reviewee history lookups
            builder.HasIndex(r => r.RevieweeId);

            // Create index on Rating for filtering/sorting
            builder.HasIndex(r => r.Rating);
        }
    }
}
