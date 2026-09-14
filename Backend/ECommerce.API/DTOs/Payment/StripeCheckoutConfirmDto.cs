using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Payment
{
    public class StripeCheckoutConfirmDto
    {
        [Required]
        [StringLength(500, MinimumLength = 10)]
        public string ShippingAddress { get; set; }
            = string.Empty;

        [Required]
        [RegularExpression(
            @"^[0-9+\-\s()]{7,20}$",
            ErrorMessage = "Contact number must be 7-20 digits and may include +, -, spaces, or parentheses.")]
        public string ContactNumber { get; set; }
            = string.Empty;

        [Required]
        public string PaymentIntentId { get; set; }
            = string.Empty;
    }
}
