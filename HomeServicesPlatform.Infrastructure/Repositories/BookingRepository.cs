using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HomeServicesPlatform.Infrastructure.Repositories
{
    public class BookingRepository : GenericRepository<Booking>, IBookingRepository
    {
        public BookingRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<bool> IsSlotAlreadyBookedAsync(int slotId)
        {
            return await _context.TimeSlots
                .Where(s => s.Id == slotId)
                .Select(s => s.IsBooked)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByCustomerAsync(string customerId)
        {
            return await _context.Bookings
                .Where(b => b.CustomerId == customerId)
                .Include(b => b.Provider)
                .Include(b => b.Service)
                .Include(b => b.Slot)
                .ToListAsync();
        }

        public async Task<IEnumerable<Booking>> GetBookingsByProviderAsync(int providerId)
        {
            return await _context.Bookings
                .Where(b => b.ProviderId == providerId)
                .Include(b => b.Customer)
                .Include(b => b.Service)
                .Include(b => b.Slot)
                .ToListAsync();
        }
    }
}