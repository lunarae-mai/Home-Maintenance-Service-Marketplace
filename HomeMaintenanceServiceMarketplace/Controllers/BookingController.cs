using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using HomeServicesPlatform.Application.DTOs.Booking;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Application.DTOs.Common;

namespace HomeServicesPlatform.API.Controllers
{
    /// <summary>
    /// Provides endpoints for creating and managing service bookings.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IAppDbContext _context;

        public BookingController(IBookingService bookingService, IAppDbContext context)
        {
            _bookingService = bookingService;
            _context = context;
        }

        // ─────────────────────────────────────────────
        // CUSTOMER ENDPOINTS
        // ─────────────────────────────────────────────

        /// <summary>
        /// Creates a new booking for a selected service provider.
        /// </summary>
        /// <param name="dto">The booking information.</param>
        /// <returns>The created booking.</returns>
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });

            var result = await _bookingService.CreateBookingAsync(customerId, dto);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Booking created successfully.",
                Data = result
            });
        }

        /// <summary>
        /// Finalizes a checkout booking with address and phone coordinates.
        /// </summary>
        /// <param name="dto">The finalized booking information.</param>
        /// <returns>A confirmation of finalization.</returns>
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost("finalize")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> FinalizeBooking([FromBody] CreateBookingDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });

            var result = await _bookingService.CreateBookingAsync(customerId, dto);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Booking finalized successfully.",
                Data = result
            });
        }

        /// <summary>
        /// Retrieves the full booking history for the authenticated customer (active and past).
        /// </summary>
        /// <returns>Active and past bookings for the logged-in customer.</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [HttpGet("my-bookings")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings()
        {
            // Use the authenticated user's identity from the JWT — never trust a path param
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });

            var active = await _bookingService.GetCustomerActiveBookingsAsync(customerId);
            var past   = await _bookingService.GetCustomerPastBookingsAsync(customerId);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Booking history retrieved successfully.",
                Data = new
                {
                    ActiveBookings = active,
                    PastBookings   = past
                }
            });
        }

        /// <summary>
        /// Updates the notes on a booking. Only allowed when the booking status is Pending.
        /// </summary>
        /// <param name="id">The booking identifier.</param>
        /// <param name="dto">The updated notes.</param>
        /// <returns>The updated booking.</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPut("{id}/update-notes")]
        [Authorize]
        public async Task<IActionResult> UpdateBookingNotes(int id, [FromBody] UpdateBookingDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Unauthorized."
                });

            var result = await _bookingService.UpdateBookingAsync(id, customerId, dto);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Booking notes updated successfully.",
                Data = result
            });
        }

        /// <summary>
        /// Cancels an existing booking. Only allowed if status is Pending or Confirmed.
        /// </summary>
        /// <param name="id">The booking identifier.</param>
        /// <returns>A confirmation that the booking has been cancelled.</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPut("{id}/cancel")]
        [Authorize(Roles = "Customer,Provider")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var result = await _bookingService.CancelBookingAsync(id);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Booking cancelled successfully.",
                Data = result
            });
        }

        // ─────────────────────────────────────────────
        // PROVIDER ENDPOINTS
        // ─────────────────────────────────────────────

        /// <summary>
        /// Retrieves all Pending booking requests for the authenticated provider.
        /// </summary>
        /// <returns>List of pending booking requests.</returns>
        [HttpGet("provider/my-pending")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> GetMyPendingRequests()
        {
            var providerId = await GetCurrentProviderIdAsync();
            if (providerId == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Provider profile not found for the current user."
                });

            var requests = await _bookingService.GetIncomingRequestsAsync(providerId.Value);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Pending booking requests retrieved successfully.",
                Data = requests
            });
        }

        /// <summary>
        /// Retrieves all bookings (all statuses) for the authenticated provider.
        /// </summary>
        /// <returns>All bookings for the logged-in provider.</returns>
        [HttpGet("provider/my-bookings")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> GetMyProviderBookings()
        {
            var providerId = await GetCurrentProviderIdAsync();
            if (providerId == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Provider profile not found for the current user."
                });

            var bookings = await _bookingService.GetProviderBookingsAsync(providerId.Value);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Bookings retrieved successfully.",
                Data = bookings
            });
        }

        /// <summary>
        /// Retrieves today's scheduled bookings for the authenticated provider.
        /// </summary>
        /// <returns>Today's bookings for the logged-in provider.</returns>
        [HttpGet("provider/my-today-schedule")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> GetMyTodaySchedule()
        {
            var providerId = await GetCurrentProviderIdAsync();
            if (providerId == null)
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Provider profile not found for the current user."
                });

            var schedule = await _bookingService.GetTodayScheduleAsync(providerId.Value);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Today's schedule retrieved successfully.",
                Data = schedule
            });
        }

        /// <summary>
        /// Confirms (accepts) a pending booking request.
        /// Transitions the booking status from Pending to Confirmed.
        /// </summary>
        [HttpPut("{id}/confirm")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> ConfirmBooking(int id, [FromBody] ConfirmBookingRequestDto? dto)
        {
            var notes  = dto?.ProviderNotes ?? string.Empty;
            var result = await _bookingService.ConfirmBookingAsync(id, notes);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Booking confirmed successfully.",
                Data = result
            });
        }

        /// <summary>
        /// Rejects a pending booking request and frees the time slot.
        /// </summary>
        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> RejectBooking(int id)
        {
            var result = await _bookingService.RejectBookingAsync(id);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Booking rejected successfully.",
                Data = result
            });
        }

        /// <summary>
        /// Marks a confirmed booking as In Progress (work has started).
        /// </summary>
        [HttpPut("{id}/start")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> StartBooking(int id)
        {
            var result = await _bookingService.StartBookingAsync(id);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Booking started successfully.",
                Data = result
            });
        }

        /// <summary>
        /// Marks an in-progress booking as Completed (work is done).
        /// </summary>
        [HttpPut("{id}/complete")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> CompleteBooking(int id)
        {
            var result = await _bookingService.CompleteBookingAsync(id);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Booking completed successfully.",
                Data = result
            });
        }

        /// <summary>
        /// Submits verification details for a completed booking cash payment.
        /// </summary>
        [HttpPost("{bookingId}/submit-payment")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> SubmitPayment(int bookingId, [FromBody] SubmitPaymentDto dto)
        {
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(customerId))
                return Unauthorized(new ApiResponse<object> { Success = false, Message = "Unauthorized." });

            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId && b.CustomerId == customerId);
            if (booking == null)
                return NotFound(new ApiResponse<object> { Success = false, Message = "Booking not found." });

            booking.PaidAmount = dto.AmountPaid;
            booking.PaymentMethod = string.IsNullOrEmpty(dto.PaymentMethod) ? "Cash" : dto.PaymentMethod;
            booking.PaymentStatus = "Submitted";
            booking.IsPaymentVerified = false;

            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Payment details submitted successfully for verification."
            });
        }

        /// <summary>
        /// Confirms receipt of payment by the provider, marking payment verified and updating status.
        /// </summary>
        [HttpPost("{bookingId}/confirm-payment")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> ConfirmPayment(int bookingId)
        {
            var providerId = await GetCurrentProviderIdAsync();
            if (providerId == null)
                return NotFound(new ApiResponse<object> { Success = false, Message = "Provider profile not found." });

            var booking = await _context.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId && b.ProviderId == providerId.Value);
            if (booking == null)
                return NotFound(new ApiResponse<object> { Success = false, Message = "Booking not found." });

            booking.IsPaymentVerified = true;
            booking.PaymentStatus = "Paid";
            booking.Status = BookingStatus.Paid;

            await _context.SaveChangesAsync();

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Payment confirmed successfully by the provider."
            });
        }

        // ─────────────────────────────────────────────
        // PRIVATE HELPERS
        // ─────────────────────────────────────────────

        /// <summary>
        /// Resolves the ProviderProfile.Id for the currently authenticated user.
        /// Returns null if no provider profile exists for this user.
        /// </summary>
        private async Task<int?> GetCurrentProviderIdAsync()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return null;

            var provider = await _context.ProviderProfiles
                .FirstOrDefaultAsync(p => p.UserId == userId);

            return provider?.Id;
        }
    }

    // ─────────────────────────────────────────────
    // LOCAL REQUEST DTOs
    // ─────────────────────────────────────────────

    public class ConfirmBookingRequestDto
    {
        public string ProviderNotes { get; set; } = string.Empty;
    }

    public class SubmitPaymentDto
    {
        public decimal AmountPaid { get; set; }
        public string Reference { get; set; } = string.Empty;
        public string PaymentMethod { get; set; } = "Cash";
    }
}
