namespace ECommerce.API.DTOs.Payment
{
    public class CreatePaymentIntentDto
    {
        public string PaymentMethod { get; set; }
            = "Stripe";
    }
}