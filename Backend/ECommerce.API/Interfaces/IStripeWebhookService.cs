using Stripe;

namespace ECommerce.API.Interfaces
{
    /// <summary>
    /// Dispatches Stripe webhook events to the shared
    /// success/failure handlers in IPaymentService.
    /// </summary>
    public interface IStripeWebhookService
    {
        Task HandleEventAsync(Stripe.Event stripeEvent);
    }
}
