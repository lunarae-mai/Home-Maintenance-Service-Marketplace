using HomeServicesPlatform.Application.DTOs.Booking;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Enums;
using HomeServicesPlatform.Domain.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HomeServicesPlatform.Application.Services
{ 
    public class BookingService : IBookingService
    {
        private readonly IBookingRepository _bookingRepository;
        private readonly IAppDbContext _context;

        public BookingService(IBookingRepository bookingRepository, IAppDbContext context)
        {
            _bookingRepository = bookingRepository;
            _context = context;
        }

        public async Task<BookingResponseDto> CreateBookingAsync(string customerId, CreateBookingDto dto)
        {
            //concurrency / slot engine / s3
            var slot = await _context.TimeSlots.FindAsync(dto.SlotId);

            if (slot == null)
                throw new KeyNotFoundException("Time slot not found.");

            if (slot.ProviderId != dto.ProviderId)
                throw new InvalidOperationException("The selected slot does not belong to this provider.");

            if (slot.IsBooked)
                throw new InvalidOperationException("This time slot is already booked. Please choose another slot.");

            if (slot.Date < DateTime.Today || (slot.Date == DateTime.Today && slot.StartTime < DateTime.Now.TimeOfDay))
                throw new InvalidOperationException("This time slot has already passed and cannot be booked.");

            slot.IsBooked = true;
            _context.TimeSlots.Update(slot);

            var booking = new Booking
            {
                CustomerId = customerId,
                ProviderId = dto.ProviderId,
                ServiceId = dto.ServiceId,
                SlotId = dto.SlotId,
                Notes = dto.Notes,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _bookingRepository.AddAsync(booking);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new InvalidOperationException(
                    "This time slot was just booked by someone else. Please choose a different slot.");
            }

            return MapToDto(booking);
            /*
            // check the slot is free or not
            bool slotTaken = await _bookingRepository.IsSlotAlreadyBookedAsync(dto.SlotId);
            if (slotTaken)
                throw new InvalidOperationException("This time slot is already booked. Please choose another slot.");

            // Verify the slot belongs to the requested provider
            var slot = await _context.TimeSlots.FindAsync(dto.SlotId);
            if (slot == null)
                throw new KeyNotFoundException("Time slot not found.");

            if (slot.ProviderId != dto.ProviderId)
                throw new InvalidOperationException("The selected slot does not belong to this provider.");

            //  booking
            var booking = new Domain.Models.Booking
            {
                CustomerId = customerId,
                ProviderId = dto.ProviderId,
                ServiceId = dto.ServiceId,
                SlotId = dto.SlotId,
                Notes = dto.Notes,
                Status = BookingStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            await _bookingRepository.AddAsync(booking);

            //  Mark the slot as booked 
            slot.IsBooked = true;
            _context.TimeSlots.Update(slot);

            await _context.SaveChangesAsync();

            return MapToDto(booking);
        */
        }
        

        // Pending → Confirmed  (provider accepts the booking)
        public async Task<BookingResponseDto> ConfirmBookingAsync(int bookingId, string providerNotes = "")
        {
            var booking = await GetBookingOrThrowAsync(bookingId);
            EnsureStatus(booking, BookingStatus.Pending, "confirm");

            booking.Status = BookingStatus.Confirmed;
            booking.ProviderNotes = providerNotes;
            _bookingRepository.Update(booking);
            await _context.SaveChangesAsync();

            return MapToDto(booking);
        }

// Pending → Rejected  (provider declines the booking and frees the slot)
        public async Task<BookingResponseDto> RejectBookingAsync(int bookingId)
        {
            var booking = await GetBookingOrThrowAsync(bookingId);
            EnsureStatus(booking, BookingStatus.Pending, "reject");

            booking.Status = BookingStatus.Rejected;
            _bookingRepository.Update(booking);

            // Free the slot so another customer can book it
            var slot = await _context.TimeSlots.FindAsync(booking.SlotId);
            if (slot != null)
            {
                slot.IsBooked = false;
                _context.TimeSlots.Update(slot);
            }

            await _context.SaveChangesAsync();

            return MapToDto(booking);
        }
        // Confirmed → In Progress  (work has started)
        public async Task<BookingResponseDto> StartBookingAsync(int bookingId)
        {
            var booking = await GetBookingOrThrowAsync(bookingId);
            EnsureStatus(booking, BookingStatus.Confirmed, "start");

            booking.Status = BookingStatus.InProgress;
            _bookingRepository.Update(booking);
            await _context.SaveChangesAsync();

            return MapToDto(booking);
        }

        // In Progress → Completed  (work is done)
        public async Task<BookingResponseDto> CompleteBookingAsync(int bookingId)
        {
            var booking = await GetBookingOrThrowAsync(bookingId);
            EnsureStatus(booking, BookingStatus.InProgress, "complete");

            booking.Status = BookingStatus.Completed;
            _bookingRepository.Update(booking);
            await _context.SaveChangesAsync();

            return MapToDto(booking);
        }

        //cancellation ... allowed before in progress
        public async Task<BookingResponseDto> CancelBookingAsync(int bookingId)
        {
            var booking = await GetBookingOrThrowAsync(bookingId);

            // cant cancel once work has started
            if (booking.Status == BookingStatus.InProgress ||
                booking.Status == BookingStatus.Completed ||
                booking.Status == BookingStatus.Paid)
            {
                throw new InvalidOperationException(
                    "Cancellation is only allowed before the booking is In Progress.");
            }

            if (booking.Status == BookingStatus.Cancelled)
                throw new InvalidOperationException("Booking is already cancelled.");

            booking.Status = BookingStatus.Cancelled;
            _bookingRepository.Update(booking);

            // Free up the time slot so someone else can book it
            var slot = await _context.TimeSlots.FindAsync(booking.SlotId);
            if (slot != null)
            {
                slot.IsBooked = false;
                _context.TimeSlots.Update(slot);
            }

            await _context.SaveChangesAsync();

            return MapToDto(booking);
        }

 
        public async Task<IEnumerable<BookingResponseDto>> GetMyBookingsAsync(string customerId)
        {
            var bookings = await _bookingRepository.GetBookingsByCustomerAsync(customerId);
            return bookings.Select(MapToDto);
        }

        //helpers
        private async Task<Domain.Models.Booking> GetBookingOrThrowAsync(int bookingId)
        {
            var booking = await _bookingRepository.GetByIdAsync(bookingId);
            if (booking == null)
                throw new KeyNotFoundException($"Booking with ID {bookingId} not found.");
            return booking;
        }

        private static void EnsureStatus(Domain.Models.Booking booking, BookingStatus required, string action)
        {
            if (booking.Status != required)
                throw new InvalidOperationException(
                    $"Cannot {action} a booking that is currently '{booking.Status}'. " +
                    $"Expected status: '{required}'.");
        }

        private static BookingResponseDto MapToDto(Domain.Models.Booking b) => new()
        {
            Id = b.Id,
            CustomerId = b.CustomerId,
            ProviderId = b.ProviderId,
            ServiceId = b.ServiceId,
            SlotId = b.SlotId,
            Notes = b.Notes,
            ProviderNotes = b.ProviderNotes,
            Status = b.Status,
            StatusLabel = b.Status.ToString(),
            CreatedAt = b.CreatedAt
        };

        public async Task<IEnumerable<Booking>> GetCustomerActiveBookingsAsync(string customerId)
        {
            var bookings =
                await _bookingRepository.GetBookingsByCustomerAsync(customerId);

            return bookings.Where(b =>
                b.Status == BookingStatus.Pending ||
                b.Status == BookingStatus.Confirmed ||
                b.Status == BookingStatus.InProgress);
        }

        //public async Task<IEnumerable<BookingResponseDto>> GetCustomerActiveBookingsAsync(string customerId)
        //{
        //    var bookings =
        //        await _bookingRepository.GetBookingsByCustomerAsync(customerId);

        //    return bookings
        //        .Where(b =>
        //            b.Status == BookingStatus.Pending ||
        //            b.Status == BookingStatus.Confirmed ||
        //            b.Status == BookingStatus.InProgress)
        //        .Select(MapToDto);
        //}

        public async Task<IEnumerable<Booking>> GetIncomingRequestsAsync(int providerId)
        {
            var bookings =
                await _bookingRepository.GetBookingsByProviderAsync(providerId);

            return bookings.Where(b =>
                b.Status == BookingStatus.Pending);
        }
 
        //public async Task UpdateBookingStatusAsync(
        //int bookingId,
        //BookingStatus newStatus)
        //{
        //    var booking =
        //        await _bookingRepository.GetByIdAsync(bookingId);

        //    if (booking == null)
        //        throw new Exception("Booking not found");
        //    if (newStatus == BookingStatus.Completed &&
        //booking.Status != BookingStatus.InProgress)
        //    {
        //        throw new Exception(
        //            "Booking must be InProgress before being completed");
        //    }
        //    if (newStatus == BookingStatus.Cancelled &&
        //booking.Status == BookingStatus.Confirmed)
        //    {
        //        throw new Exception(
        //            "Confirmed bookings cannot be cancelled");
        //    }
        //    booking.Status = newStatus;

        //    await _bookingRepository.UpdateAsync(booking);
        //}
       
        public async Task<IEnumerable<Booking>> GetTodayScheduleAsync(int providerId)
        {
            var bookings =
                await _bookingRepository.GetBookingsByProviderAsync(providerId);

            return bookings.Where(b =>
                b.Slot.Date.Date == DateTime.Today);
        }

        public async Task<IEnumerable<Booking>> GetCustomerPastBookingsAsync(string customerId)
        {
            var bookings =
                await _bookingRepository.GetBookingsByCustomerAsync(customerId);

            return bookings.Where(b =>
                b.Status == BookingStatus.Completed ||
                b.Status == BookingStatus.Paid ||
                b.Status == BookingStatus.Cancelled);
        }

        public async Task<IEnumerable<Booking>> GetProviderBookingsAsync(int providerId)
        {
            return await _bookingRepository.GetBookingsByProviderAsync(providerId);
        }
    }
}