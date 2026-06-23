using HomeServicesPlatform.Application.DTOs.Payment;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Infrastructure.Data; 
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly AppDbContext _context;
        private const decimal CommissionRate = 0.10m; // 10% platform commission 

        public PaymentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> ProcessPaymentAsync(CreatePaymentDto dto)
        {
            // 1. Fetch booking
            var booking = await _context.Bookings.FindAsync(dto.BookingId);

            // 2. Validate
            if (booking == null || booking.Status != 2 )
                return false;

            // 3. Prevent duplicate payment
            var existingPayment = await _context.Payments.AnyAsync(p => p.BookingId == dto.BookingId);
            if (existingPayment)
                return false;

            // 4. Calculate commission
            decimal commission = dto.FinalAmount * CommissionRate;

            // 5. Create payment object
            var payment = new Payment
            {
                BookingId = dto.BookingId,
                Amount = dto.FinalAmount,
                Commission = commission,
                PaymentMethod = dto.Method,
                PaymentStatus = "Paid",
                PaidAt = DateTime.UtcNow
            };

            // 6. Update booking status
            booking.Status = 3 ;

            // 7. Save to database
            _context.Payments.Add(payment);
            _context.Bookings.Update(booking);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}