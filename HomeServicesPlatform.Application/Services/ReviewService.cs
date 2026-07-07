using HomeServicesPlatform.Application.DTOs.Review;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;


namespace HomeServicesPlatform.Application.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IAppDbContext _context;
        private readonly ILogger<ReviewService> _logger;

        // Constructor
        public ReviewService(IAppDbContext context, ILogger<ReviewService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // Function to create the review and add it to the database
        public async Task AddReviewAsync(string currentUserId, CreateReviewDto dto)
        {
            try
            {
                // Step 1 - Validate Rating
                if (dto.Rating < 1 || dto.Rating > 5)
                    throw new Exception("Rating must be between 1 and 5.");

                // Step 2 - Load Booking (We need both the payment and the provider profile)
                var booking = await _context.Bookings
                    .Include(b => b.Payment)
                    .Include(b => b.Provider)
                    .FirstOrDefaultAsync(b => b.Id == dto.BookingId);

                if (booking == null)
                    throw new Exception("Booking not found.");

                // Step 3 - Ensure work is finished
                if (booking.Status != BookingStatus.Paid)
                {
                    throw new Exception(
                        "Reviews are only allowed after payment is completed.");
                }

                // Step 4 - Verify Payment
                if (booking.Payment == null || booking.Payment.PaymentStatus != "Paid")
                {
                    throw new Exception(
                        "Payment has not been completed.");
                }

                // Step 5 - Determine Reviewer
                string reviewerType;
                string revieweeId;

                // Check who the logged-in user is; Customer or Provider ?
                if (booking.CustomerId == currentUserId)
                {
                    reviewerType = "Customer";
                    revieweeId = booking.Provider.UserId;
                }
                else if (booking.Provider.UserId == currentUserId)
                {
                    reviewerType = "Provider";
                    revieweeId = booking.CustomerId;
                }
                else
                {
                    throw new Exception(
                        "You are not part of this booking.");
                }

                // Step 6 - Duplicate review check
                bool alreadyReviewed = await _context.Reviews.AnyAsync(r =>
                                            r.BookingId == dto.BookingId &&
                                            r.ReviewerId == currentUserId);

                if (alreadyReviewed)
                {
                    throw new Exception(
                        "You have already submitted a review for this booking.");
                }

                // Step 7 - Create Review 
                var review = new Review
                {
                    BookingId = dto.BookingId,

                    ReviewerId = currentUserId,

                    RevieweeId = revieweeId,

                    ReviewerType = reviewerType,

                    Rating = dto.Rating,

                    Comment = dto.Comment,

                    CreatedAt = DateTime.UtcNow
                };

                // Step 8 - Save
                _context.Reviews.Add(review);

                // Step 9 - Update Provider Average Rating Score
                // Only providers' ratings are averaged
                if (reviewerType == "Customer")
                {
                    var ratings = await _context.Reviews

                        .Where(r =>
                            r.RevieweeId == revieweeId &&
                            r.ReviewerType == "Customer")
                        .Select(r => r.Rating)
                        .ToListAsync();

                    // Add the last rating because it is not saved yet in the database
                    ratings.Add(dto.Rating);

                    // Compute the average of all the providers' ratings
                    booking.Provider.AvgRating = (decimal) Math.Round(ratings.Average(), 2);
                }

                // Step 10 - Save Everything
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while adding review.");

                throw;
            }
        }

        // Function to view a provider's review
        public async Task<IEnumerable<Review>> GetProviderReviewsAsync(int providerId)
        {
            var provider = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.Id == providerId);

            if (provider == null)
                throw new KeyNotFoundException("Provider not found.");

            return await _context.Reviews
                .Where(r =>
                    r.RevieweeId == provider.UserId &&
                    r.ReviewerType == "Customer")
                .Include(r => r.Reviewer)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        // Function to view all the reviews done by the logged-in users
        public async Task<IEnumerable<Review>> GetMyReviewsAsync(string currentUserId)
        {
            return await _context.Reviews
                .Where(r => r.ReviewerId == currentUserId)
                .Include(r => r.Reviewee)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

    }
}
