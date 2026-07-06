using HomeServicesPlatform.Application.DTOs.Payment;
using HomeServicesPlatform.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeServicesPlatform.API.Controllers
{
    /// <summary>
    /// Provides endpoints for processing and verifying payments.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Verifies a cash payment and marks the booking as paid.
        /// </summary>
        /// <param name="dto">The payment verification information.</param>
        /// <returns>A confirmation that the payment was successfully verified.</returns>
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [HttpPost("verify-cash")]
        [Authorize(Roles = "Provider")]
        public async Task<IActionResult> VerifyCashPayment([FromBody] CreatePaymentDto dto)
        {
            var result = await _paymentService.ProcessPaymentAsync(dto);

            if (!result)
            {
                return BadRequest(new
                {
                    message = "Payment could not be processed. Ensure booking is completed and not already paid."
                });
            }

            return Ok(new
            {
                message = "Payment verified successfully. Status updated to Paid."
            });
        }
    }
}