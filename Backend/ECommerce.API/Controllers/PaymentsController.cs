using System.Security.Claims;
using ECommerce.API.Configuration;
using ECommerce.API.DTOs.Payment;
using ECommerce.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Stripe;

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

        private readonly IStripeWebhookService
            _stripeWebhookService;

        private readonly StripeSettings _stripeSettings;

        public PaymentController(
            IPaymentService paymentService,
            IStripeWebhookService stripeWebhookService,
            IOptions<StripeSettings> stripeSettings)
        {
            _paymentService =
                paymentService;

            _stripeWebhookService =
                stripeWebhookService;

            _stripeSettings =
                stripeSettings.Value;
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

        // =========================================================
        // STRIPE WEBHOOK — Stripe is the caller, not a customer.
        // Signature verification prevents spoofed callbacks.
        // Returning 500 on handler exception triggers Stripe's
        // automatic retry — which is safe because
        // HandleStripePaymentSucceededAsync is fully idempotent.
        // =========================================================

        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> StripeWebhook()
        {
            string json;

            using (var reader = new StreamReader(
                HttpContext.Request.Body))
            {
                json = await reader.ReadToEndAsync();
            }

            var signature =
                Request.Headers["Stripe-Signature"].ToString();

            if (string.IsNullOrWhiteSpace(signature))
            {
                return BadRequest(new
                {
                    message = "Missing Stripe-Signature header."
                });
            }

            if (string.IsNullOrWhiteSpace(
                _stripeSettings.WebhookSecret) ||
                _stripeSettings.WebhookSecret.StartsWith(
                    "whsec_REPLACE"))
            {
                return BadRequest(new
                {
                    message = "WebhookSecret is not configured."
                });
            }

            Stripe.Event stripeEvent;

            try
            {
                stripeEvent =
                    EventUtility.ConstructEvent(
                        json,
                        signature,
                        _stripeSettings.WebhookSecret);
            }
            catch (StripeException ex)
            {
                return BadRequest(new
                {
                    message =
                        $"Invalid signature: {ex.StripeError?.Message ?? ex.Message}"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message =
                        $"Webhook parse error: {ex.Message}"
                });
            }

            try
            {
                await _stripeWebhookService
                    .HandleEventAsync(stripeEvent);

                return Ok();
            }
            catch (Exception ex)
            {
                // Returning 500 → Stripe retries. Safe because
                // the shared handler is idempotent.
                return StatusCode(
                    500,
                    new
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
