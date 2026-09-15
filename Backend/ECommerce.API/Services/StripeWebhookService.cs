using ECommerce.API.Interfaces;
using Microsoft.Extensions.Logging;
using Stripe;

namespace ECommerce.API.Services
{
    public class StripeWebhookService
        : IStripeWebhookService
    {
        private readonly IPaymentService _paymentService;
        private readonly ILogger<StripeWebhookService> _logger;

        public StripeWebhookService(
            IPaymentService paymentService,
            ILogger<StripeWebhookService> logger)
        {
            _paymentService = paymentService;
            _logger = logger;
        }

        public async Task HandleEventAsync(
            Stripe.Event stripeEvent)
        {
            switch (stripeEvent.Type)
            {
                case "payment_intent.succeeded":
                {
                    var paymentIntent = stripeEvent.Data
                        .Object as PaymentIntent;

                    if (paymentIntent == null)
                    {
                        _logger.LogWarning(
                            "payment_intent.succeeded but object missing.");
                        return;
                    }

                    var customerId =
                        ExtractCustomerId(paymentIntent);

                    if (customerId == null)
                    {
                        _logger.LogWarning(
                            "Missing customerId in metadata for {Id}.",
                            paymentIntent.Id);
                        return;
                    }

                    await _paymentService
                        .HandleStripePaymentSucceededAsync(
                            customerId.Value,
                            paymentIntent);
                    break;
                }

                case "payment_intent.payment_failed":
                {
                    var paymentIntent = stripeEvent.Data
                        .Object as PaymentIntent;

                    if (paymentIntent == null)
                    {
                        _logger.LogWarning(
                            "payment_intent.payment_failed but object missing.");
                        return;
                    }

                    var failureMessage =
                        paymentIntent.LastPaymentError?.Message
                            ?? "Payment failed.";

                    await _paymentService
                        .HandleStripePaymentFailedAsync(
                            paymentIntent,
                            failureMessage);
                    break;
                }

                case "charge.refunded":
                {
                    // Refund events are handled by the
                    // existing CreateRefundAsync / Refund
                    // flow; we just acknowledge here so
                    // Stripe stops retrying.
                    _logger.LogInformation(
                        "Refund event received.");
                    break;
                }

                default:
                    _logger.LogInformation(
                        "Unhandled Stripe event type: {Type}",
                        stripeEvent.Type);
                    break;
            }
        }

        private static int? ExtractCustomerId(
            PaymentIntent paymentIntent)
        {
            if (paymentIntent.Metadata == null)
            {
                return null;
            }

            if (paymentIntent.Metadata.TryGetValue(
                "customerId", out var raw) &&
                int.TryParse(raw, out var id))
            {
                return id;
            }

            return null;
        }
    }
}
