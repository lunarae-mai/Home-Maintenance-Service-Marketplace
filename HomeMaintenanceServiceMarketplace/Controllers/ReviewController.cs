using HomeServicesPlatform.Application.DTOs.Review;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReviewController : ControllerBase
    {
        private readonly IReviewService _reviewService;

        // Constructor
        public ReviewController(IReviewService reviewService)
        {
            _reviewService = reviewService;
        }

        // Route 1
        [HttpPost]
        [Authorize(Roles = "Customer,Provider")]
        public async Task<IActionResult> AddReview(CreateReviewDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            try
            {
                await _reviewService.AddReviewAsync(userId, dto);

                return Ok(new
                {
                    message = "Review submitted successfully."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        // Route 2
        [HttpGet("provider/{providerId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProviderReviews(int providerId)
        {
            var reviews = await _reviewService.GetProviderReviewsAsync(providerId);

            return Ok(reviews);
        }

        // Route 3
        [HttpGet("my")]
        public async Task<IActionResult> GetMyReviews()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var reviews =
                await _reviewService.GetMyReviewsAsync(userId);

            return Ok(reviews);
        }
    }
}

