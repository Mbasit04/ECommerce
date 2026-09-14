using System.ComponentModel.DataAnnotations;
using ECommerce.API.Models;

namespace ECommerce.API.DTOs.Order
{
    public class CreateOrderDto
    {
        [Required]
        [MinLength(1)]
        public List<OrderItemDto> Items { get; set; }
            = new();

        [Range(1, int.MaxValue)]
        public int PaymentMethodId { get; set; }

        [Required]
        [StringLength(1000)]
        public string ShippingAddress { get; set; }
            = string.Empty;

        [StringLength(100)]
        public string? City { get; set; }

        [StringLength(30)]
        public string? PhoneNumber { get; set; }
    }
}
