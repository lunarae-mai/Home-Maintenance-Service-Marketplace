using HomeServicesPlatform.Application.DTOs.Payment;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Domain.Models;
using HomeServicesPlatform.Domain.Enums;
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

            // 2. Validate booking exists and is in Completed status (work is done)
            if (booking == null || booking.Status != BookingStatus.Completed)
                return false;

            // 3. Prevent duplicate payment
            var existingPayment = await _context.Payments.AnyAsync(p => p.BookingId == dto.BookingId);
            if (existingPayment)
                return false;

            // 4. Calculate commission (10%)
            decimal commission = dto.FinalAmount * CommissionRate;

            // 5. Create payment object
            var payment = new Payment
            {
                BookingId = dto.BookingId,
                Amount = dto.FinalAmount,
                Commission = commission,
                // ProviderEarnings is a computed property (Amount - Commission)
                PaymentMethod = dto.Method,
                PaymentStatus = "Paid",
                PaidAt = DateTime.UtcNow
            };

            // 6. Update booking status to Paid
            booking.Status = BookingStatus.Paid;

            // 7. Save to database
            _context.Payments.Add(payment);
            _context.Bookings.Update(booking);

            await _context.SaveChangesAsync();

            // 8. Review Trigger: Once payment is saved, reviews are enabled
            // The system can now allow both parties to review each other
            // This is handled by checking booking.Status == Paid in the review logic

            return true;
        }
    }
}