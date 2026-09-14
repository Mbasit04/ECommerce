namespace ECommerce.API.DTOs.Payment
{
    public class StripeCheckoutResponseDto
    {
        public int OrderId { get; set; }

        public string CheckoutUrl { get; set; }
            = string.Empty;
    }
}