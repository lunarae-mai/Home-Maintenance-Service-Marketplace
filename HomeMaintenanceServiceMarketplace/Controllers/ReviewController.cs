
namespace HomeServicesPlatform.API.Controllers
{
<<<<<<< Updated upstream
    public class ReviewController 
    {
       
=======
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewController : ControllerBase
    {/// <summary>
/// Provides endpoints for creating reviews for completed bookings.
/// </summary>
        private readonly IAppDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public ReviewController(IAppDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }
/// <summary>
/// Creates a review for a completed booking.
/// </summary>
/// <param name="dto">The review information.</param>
/// <returns>The created review.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
        // POST: api/review
        [HttpPost]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto dto)
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // 1. Fetch the booking
            var booking = await _context.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Provider)
                .FirstOrDefaultAsync(b => b.Id == dto.BookingId);

            if (booking == null)
                return NotFound(new { message = "Booking not found." });

            // 2. REVIEW TRIGGER VALIDATION: Check if booking is Paid
            if (booking.Status != BookingStatus.Paid)
                return BadRequest(new { message = "Reviews can only be submitted after payment is completed." });

            // 3. Verify the current user is part of this booking
            if (booking.CustomerId != userId && booking.Provider.UserId != userId)
                return Forbid();

            // 4. Check if user already reviewed this booking
            var existingReview = await _context.Reviews
                .AnyAsync(r => r.BookingId == dto.BookingId && r.ReviewerId == userId);

            if (existingReview)
                return BadRequest(new { message = "You have already reviewed this booking." });

            // 5. Determine reviewee (the other party)
            string revieweeId;
            string reviewerType;

            if (booking.CustomerId == userId)
            {
                // Customer is reviewing Provider
                revieweeId = booking.Provider.UserId;
                reviewerType = "Customer";
            }
            else
            {
                // Provider is reviewing Customer
                revieweeId = booking.CustomerId;
                reviewerType = "Provider";
            }

            // 6. Create review
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

            // 7. Update provider's average rating if reviewee is a provider
            if (reviewerType == "Customer")
            {
                await UpdateProviderAverageRating(booking.ProviderId);
            }

            return Ok(new { message = "Review submitted successfully." });
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

            return Ok(reviews);
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
        // GET: api/review/can-review/{bookingId}
        [HttpGet("can-review/{bookingId}")]
        public async Task<IActionResult> CanReview(int bookingId)
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var booking = await _context.Bookings
                .Include(b => b.Provider)
                .FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                return NotFound();

            // Check if user is part of the booking
            if (booking.CustomerId != userId && booking.Provider.UserId != userId)
                return Forbid();

            // Check if booking is paid (review trigger)
            if (booking.Status != BookingStatus.Paid)
                return Ok(new { canReview = false, reason = "Payment not completed yet." });

            // Check if user already reviewed
            var hasReviewed = await _context.Reviews
                .AnyAsync(r => r.BookingId == bookingId && r.ReviewerId == userId);

            if (hasReviewed)
                return Ok(new { canReview = false, reason = "You have already reviewed this booking." });

            return Ok(new { canReview = true });
        }

        // GET: api/review/provider/{providerId}
        [HttpGet("provider/{providerId}")]
        public async Task<IActionResult> GetProviderReviews(int providerId)
        {
            var provider = await _context.ProviderProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == providerId);

            if (provider == null)
                return NotFound();

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

            return Ok(new
            {
                providerName = provider.User.Name,
                averageRating = provider.AvgRating,
                totalReviews = reviews.Count,
                reviews
            });
        }

        private async Task UpdateProviderAverageRating(int providerId)
        {
            var provider = await _context.ProviderProfiles
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == providerId);

            if (provider == null) return;

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

    // DTO for creating a review
    public class CreateReviewDto
    {
        public int BookingId { get; set; }
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
>>>>>>> Stashed changes
    }
}
