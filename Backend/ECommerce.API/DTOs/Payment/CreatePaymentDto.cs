using System.ComponentModel.DataAnnotations;
using ECommerce.API.Models;

namespace ECommerce.API.DTOs.Payment
{
    public class CreatePaymentDto
    {
        [Required]
        public int OrderId { get; set; }

        [Required]
        public PaymentMethod PaymentMethod { get; set; }
            = null!;
    }
}
