using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using HomeServicesPlatform.Application.DTOs.Booking;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Application.DTOs.Common;

namespace HomeServicesPlatform.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BookingController : ControllerBase
    { /// <summary>
/// Provides endpoints for creating and managing service bookings.
/// </summary>
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }
/// <summary>
/// Creates a new booking for a selected service provider.
/// </summary>
/// <param name="request">The booking information.</param>
/// <returns>The created booking.</returns>
[ProducesResponseType(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
   [HttpPost]
[Authorize(Roles = "Customer")]
public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
{
    var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(customerId))
    {
        return Unauthorized(new ApiResponse<object>
        {
            Success = false,
            Message = "Unauthorized."
        });
    }

    var result = await _bookingService.CreateBookingAsync(customerId, dto);

    return Ok(new ApiResponse<object>
    {
        Success = true,
        Message = "Booking created successfully.",
        Data = result
    });
}


    [HttpPut("{id}/confirm")]
    [Authorize(Roles = "Provider")]   
    public async Task<IActionResult> ConfirmBooking(int id, [FromBody] ConfirmBookingRequestDto? dto)
    {
        var notes = dto?.ProviderNotes ?? string.Empty;
        var result = await _bookingService.ConfirmBookingAsync(id, notes);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Booking confirmed successfully.",
            Data = result
        });
    }

    // StartBooking and CompleteBooking follow the exact same pattern
    //
    [HttpPut("{id}/start")]
    [Authorize(Roles = "Provider")]
    public async Task<IActionResult> StartBooking(int id)
    {
        var result = await _bookingService.StartBookingAsync(id);
        return Ok(result);
    }
    //
    [HttpPut("{id}/complete")]
    [Authorize(Roles = "Provider")]
    public async Task<IActionResult> CompleteBooking(int id)
    {
        var result = await _bookingService.CompleteBookingAsync(id);
        return Ok(result);
    } 

    
    
    [HttpPut("{id}/reject")]
    [Authorize(Roles = "Provider")]
    public async Task<IActionResult> RejectBooking(int id)
    {
        var result = await _bookingService.RejectBookingAsync(id);
        return Ok(result);
    }
/// <summary>
/// Cancels an existing booking.
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

/// <summary>
/// Retrieves all bookings created by the authenticated user.
/// </summary>
/// <returns>A list of the user's bookings.</returns>
[ProducesResponseType(StatusCodes.Status200OK)]
   [HttpGet("customer/{customerId}/history")]
[Authorize(Roles = "Customer")]
public async Task<IActionResult> GetBookingHistory(string customerId)
{
    var active = await _bookingService.GetCustomerActiveBookingsAsync(customerId);
    var past = await _bookingService.GetCustomerPastBookingsAsync(customerId);

    return Ok(new ApiResponse<object>
    {
        Success = true,
        Message = "Booking history retrieved successfully.",
        Data = new
        {
            ActiveBookings = active,
            PastBookings = past
        }
    });
}


[HttpGet("provider/{providerId}/incoming-requests")]
[Authorize(Roles = "Provider")]
public async Task<IActionResult> GetIncomingRequests(int providerId)
{
    var requests = await _bookingService.GetIncomingRequestsAsync(providerId);

    return Ok(new ApiResponse<object>
    {
        Success = true,
        Message = "Incoming requests retrieved successfully.",
        Data = requests
    });
}

    //[HttpPut("{bookingId}/status")]
    //public async Task<IActionResult> UpdateStatus(
    //int bookingId,
    //BookingStatus status)
    //{
    //    await _bookingService
    //        .UpdateBookingStatusAsync(bookingId, status);

    //    return Ok("Status updated successfully");
    //}


    [HttpGet("provider/{providerId}/today-schedule")]
    [Authorize(Roles = "Provider")]
    public async Task<IActionResult> GetTodaySchedule(int providerId)
    {
        var schedule =
            await _bookingService.GetTodayScheduleAsync(providerId);

       return Ok(new ApiResponse<object>
    {
        Success = true,
        Message = "Today's schedule retrieved successfully.",
        Data = schedule
    });
        }

    [HttpGet("provider/{providerId}/bookings")]
    [Authorize(Roles = "Provider")]
    public async Task<IActionResult> GetProviderBookings(int providerId)
    {
        var bookings = await _bookingService.GetProviderBookingsAsync(providerId);
        return Ok(new ApiResponse<object>
        {
            Success = true,
            Message = "Bookings retrieved successfully.",
            Data = bookings
        });
    }
    }

    public class ConfirmBookingRequestDto
    {
        public string ProviderNotes { get; set; } = string.Empty;
    }
}
