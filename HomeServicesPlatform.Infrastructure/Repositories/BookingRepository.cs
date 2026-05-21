using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Infrastructure.Data;

namespace HomeServicesPlatform.Infrastructure.Repositories
{
    public class BookingRepository : GenericRepository<Booking>, IBookingRepository
    {
        public BookingRepository(AppDbContext context) : base(context)
        {
        }
    }
}