using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Customer
{
    public class UpdateCartItemDto
    {
        [Range(1, 100)]
        public int Quantity { get; set; }
    }
}