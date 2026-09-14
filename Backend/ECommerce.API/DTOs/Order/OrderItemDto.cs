using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Order
{
    public class OrderItemDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(1, 1000)]
        public int Quantity { get; set; }
    }
}