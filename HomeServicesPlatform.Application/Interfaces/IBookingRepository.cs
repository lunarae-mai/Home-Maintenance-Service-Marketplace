using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Application.Interfaces;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IBookingRepository : IGenericRepository<Booking>
    {
        // Returns true if the slot is already booked 
        Task<bool> IsSlotAlreadyBookedAsync(int slotId);

        // Gets all bookings for a specific customer
        Task<IEnumerable<Booking>> GetBookingsByCustomerAsync(string customerId);

        // Gets all bookings for a specific provider
        Task<IEnumerable<Booking>> GetBookingsByProviderAsync(int providerId);


    }

}