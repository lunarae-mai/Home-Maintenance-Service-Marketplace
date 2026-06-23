using Microsoft.AspNetCore.Mvc;
using HomeServicesPlatform.Application.Interfaces;
using HomeServicesPlatform.Application.DTOs.Payment;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    // Endpoint for the Provider to manually update the PaymentStatus to Paid
    [HttpPost("verify-cash")]
    public async Task<IActionResult> VerifyCashPayment([FromBody] CreatePaymentDto dto)
    {
        var result = await _paymentService.ProcessPaymentAsync(dto);

        if (!result)
            return BadRequest(new { message = "Payment could not be processed. Ensure booking is completed and not already paid." });

        return Ok(new { message = "Payment verified successfully. Status updated to Paid." });
    }
}