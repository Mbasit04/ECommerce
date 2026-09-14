using System.Security.Claims;
using ECommerce.API.DTOs.Payment;
using ECommerce.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController
        : ControllerBase
    {
        private readonly IPaymentService
            _paymentService;

        public PaymentController(
            IPaymentService paymentService)
        {
            _paymentService =
                paymentService;
        }

        [HttpPost("create-intent")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult>
            CreatePaymentIntent()
        {
            try
            {
                var customerId =
                    GetUserId();

                var result =
                    await _paymentService
                        .CreatePaymentIntentAsync(
                            customerId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("confirm-checkout")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult>
            ConfirmStripeCheckout(
                [FromBody] StripeCheckoutConfirmDto dto)
        {
            try
            {
                var customerId =
                    GetUserId();

                var order =
                    await _paymentService
                        .ConfirmStripeCheckoutAsync(
                            customerId,
                            dto);

                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("cod/{orderId:int}/mark-paid")]
        [Authorize(Roles = "Seller,Admin")]
        public async Task<IActionResult> MarkCodPaymentAsPaid(int orderId)
        {
            try
            {
                var result = await _paymentService
                    .MarkCodPaymentAsPaidAsync(orderId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                if (ex.Message == "Order not found.")
                {
                    return NotFound(new
                    {
                        message = ex.Message
                    });
                }

                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        private int GetUserId()
        {
            var claim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                throw new UnauthorizedAccessException();
            }

            return int.Parse(
                claim.Value);
        }
    }
}
