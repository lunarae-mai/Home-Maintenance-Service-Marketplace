using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using HomeServicesPlatform.Application.DTOs.Booking;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HomeServicesPlatform.Domain.Enums; 

[ApiController]
[Route("api/[controller]")]   
[Authorize]                   
public class BookingController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto dto)
    {
        var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(customerId))
            return Unauthorized();

        try
        {
            var result = await _bookingService.CreateBookingAsync(customerId, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }


    [HttpPut("{id}/confirm")]
    [Authorize(Roles = "Provider")]   
    public async Task<IActionResult> ConfirmBooking(int id)
    {
        try
        {
            var result = await _bookingService.ConfirmBookingAsync(id);
            return Ok(result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }


    [HttpPut("{id}/cancel")]
    [Authorize(Roles = "Customer,Provider")]  
    public async Task<IActionResult> CancelBooking(int id)
    {
        try
        {
            var result = await _bookingService.CancelBookingAsync(id);
            return Ok(result);
        }
        catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
    }


    [HttpGet("customer/{customerId}/history")]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> GetBookingHistory(string customerId)
    {
        var active =
            await _bookingService.GetCustomerActiveBookingsAsync(customerId);

        var past =
            await _bookingService.GetCustomerPastBookingsAsync(customerId);

        return Ok(new
        {
            ActiveBookings = active,
            PastBookings = past
        });
    }


    [HttpGet("provider/{providerId}/incoming-requests")]
    [Authorize(Roles = "Provider")]
    public async Task<IActionResult> GetIncomingRequests(int providerId)
    {
        var requests =
            await _bookingService.GetIncomingRequestsAsync(providerId);

        return Ok(requests);
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

        return Ok(schedule);
    }

}