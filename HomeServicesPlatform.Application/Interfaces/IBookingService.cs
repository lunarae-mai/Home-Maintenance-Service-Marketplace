using HomeServicesPlatform.Application.DTOs.Booking;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Models;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IBookingService
    {
        Task<BookingResponseDto> CreateBookingAsync(string customerId, CreateBookingDto dto);
        Task<BookingResponseDto> ConfirmBookingAsync(int bookingId, string providerNotes = "");
        Task<BookingResponseDto> StartBookingAsync(int bookingId);
        Task<BookingResponseDto> CompleteBookingAsync(int bookingId);
        Task<BookingResponseDto> CancelBookingAsync(int bookingId);
        Task<BookingResponseDto> RejectBookingAsync(int bookingId);
        Task<BookingResponseDto> UpdateBookingAsync(int bookingId, string customerId, UpdateBookingDto dto);
        Task<IEnumerable<BookingResponseDto>> GetMyBookingsAsync(string customerId);
        Task<IEnumerable<Booking>> GetCustomerActiveBookingsAsync(string customerId);

        Task<IEnumerable<Booking>> GetCustomerPastBookingsAsync(string customerId);

        Task<IEnumerable<Booking>> GetIncomingRequestsAsync(int providerId);

        Task<IEnumerable<Booking>> GetTodayScheduleAsync(int providerId);
        Task<IEnumerable<Booking>> GetProviderBookingsAsync(int providerId);

        //Task UpdateBookingStatusAsync(int bookingId, BookingStatus newStatus);
    }
}