using HomeServicesPlatform.Application.DTOs.Payment;

namespace HomeServicesPlatform.Application.Interfaces
{
    public interface IPaymentService
    {
        Task<bool> ProcessPaymentAsync(CreatePaymentDto dto);
    }
}