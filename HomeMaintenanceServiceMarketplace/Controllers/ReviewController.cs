using HomeServicesPlatform.Application.DTOs.Review;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeServicesPlatform.Application.DTOs.Common;

namespace HomeServicesPlatform.API.Controllers
{
    /// <summary>
    /// Provides endpoints for creating and retrieving reviews for completed bookings.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewController : ControllerBase
    {
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ReviewController(
            IAppDbContext context,
            ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        /// <summary>
        /// Creates a review for a completed and paid booking.
        /// Only the Customer or Provider involved in the booking can submit a review.
        /// </summary>
        /// <param name="dto">The review information.</param>
        /// <returns>A confirmation that the review was submitted successfully.</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        [Authorize(Roles = "Customer,Provider")]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });

            // Load booking with all required navigation properties
            var booking = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Provider)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == dto.BookingId);

            if (booking == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Booking not found."
                });

            // Rule: Work must be finished (Completed or Paid status)
            bool workIsDone = booking.Status == BookingStatus.Completed
                           || booking.Status == BookingStatus.Paid;

            if (!workIsDone)
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Reviews can only be submitted after the booking is Completed."
                });

            // Rule: Payment must be confirmed
            bool paymentConfirmed = booking.Payment != null
                                 && booking.Payment.PaymentStatus == "Paid";

            if (!paymentConfirmed)
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Payment has not been confirmed yet."
                });

            // Rule: Only the customer or provider involved in this booking can review
            if (booking.CustomerId != userId && booking.Provider.UserId != userId)
                return Forbid();

            // Rule: No duplicate reviews — max 1 per party per booking
            var existingReview = await _context.Reviews
                .AnyAsync(r => r.BookingId == dto.BookingId && r.ReviewerId == userId);

            if (existingReview)
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "You have already reviewed this booking."
                });

            // Determine who is reviewing whom
            string revieweeId;
            string reviewerType;

            if (booking.CustomerId == userId)
            {
                revieweeId = booking.Provider.UserId;
                reviewerType = "Customer";
            }
            else
            {
                revieweeId = booking.CustomerId;
                reviewerType = "Provider";
            }

            var review = new Review
            {
                BookingId = dto.BookingId,
                ReviewerId = userId,
                RevieweeId = revieweeId,
                ReviewerType = reviewerType,
                Rating = dto.Rating,
                Comment = dto.Comment
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            // Update the provider's average rating when a customer submits a review
            if (reviewerType == "Customer")
            {
                await UpdateProviderAverageRating(booking.ProviderId);
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Review submitted successfully."
            });
        }

        /// <summary>
        /// Retrieves all reviews associated with a specific booking.
        /// </summary>
        /// <param name="bookingId">The unique identifier of the booking.</param>
        /// <returns>A list of reviews for the specified booking.</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetReviewsByBooking(int bookingId)
        {
            var reviews = await _context.Reviews
                .Where(r => r.BookingId == bookingId)
                .Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    r.ReviewerType,
                    ReviewerName = r.Reviewer.Name,
                    r.CreatedAt
                })
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Reviews retrieved successfully.",
                Data = reviews
            });
        }

        /// <summary>
        /// Checks whether the authenticated user is eligible to submit a review for a booking.
        /// </summary>
        /// <param name="bookingId">The unique identifier of the booking.</param>
        /// <returns>Indicates whether the user can submit a review and the reason if they cannot.</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet("can-review/{bookingId}")]
        public async Task<IActionResult> CanReview(int bookingId)
        {
            var userId = _currentUserService.UserId;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });

            // Include Payment so we can check its status
            var booking = await _context.Bookings
                .Include(b => b.Provider)
                .Include(b => b.Payment)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Booking not found."
                });

            // Only parties involved in the booking can check eligibility
            if (booking.CustomerId != userId && booking.Provider.UserId != userId)
                return Forbid();

            // Check 1: Work must be done
            bool workIsDone = booking.Status == BookingStatus.Completed
                           || booking.Status == BookingStatus.Paid;

            if (!workIsDone)
                return Ok(new ApiResponse<object>
                {
                    Success = false,
                    Message = "The booking has not been completed yet."
                });

            // Check 2: Payment must be confirmed
            bool paymentConfirmed = booking.Payment != null
                                 && booking.Payment.PaymentStatus == "Paid";

            if (!paymentConfirmed)
                return Ok(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Payment has not been confirmed yet."
                });

            // Check 3: Has this user already reviewed?
            var hasReviewed = await _context.Reviews
                .AnyAsync(r => r.BookingId == bookingId && r.ReviewerId == userId);

            if (hasReviewed)
                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Review eligibility checked.",
                    Data = new
                    {
                        canReview = false,
                        reason = "You have already reviewed this booking."
                    }
                });

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Review eligibility checked.",
                Data = new { canReview = true }
            });
        }

        /// <summary>
        /// Retrieves all customer reviews and rating information for a specific service provider.
        /// </summary>
        /// <param name="providerId">The unique identifier of the service provider.</param>
        /// <returns>The provider's average rating and customer reviews.</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpGet("provider/{providerId}")]
        public async Task<IActionResult> GetProviderReviews(int providerId)
        {
            var provider = await _context.ProviderProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == providerId);

            if (provider == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Provider not found."
                });

            var reviews = await _context.Reviews
                .Where(r => r.RevieweeId == provider.UserId && r.ReviewerType == "Customer")
                .Select(r => new
                {
                    r.Id,
                    r.Rating,
                    r.Comment,
                    ReviewerName = r.Reviewer.Name,
                    r.CreatedAt
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Provider reviews retrieved successfully.",
                Data = new
                {
                    providerName = provider.User.Name,
                    averageRating = provider.AvgRating,
                    totalReviews = reviews.Count,
                    reviews
                }
            });
        }

        // Private helper: recalculates and saves the provider's average rating
        private async Task UpdateProviderAverageRating(int providerId)
        {
            var provider = await _context.ProviderProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == providerId);

            if (provider == null)
                return;

            var reviews = await _context.Reviews
                .Where(r => r.RevieweeId == provider.UserId && r.ReviewerType == "Customer")
                .ToListAsync();

            if (reviews.Any())
            {
                provider.AvgRating = (decimal)reviews.Average(r => r.Rating);
                await _context.SaveChangesAsync();
            }
        }
    }
}