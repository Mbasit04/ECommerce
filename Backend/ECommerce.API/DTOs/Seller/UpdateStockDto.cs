using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Seller
{
    public class UpdateStockDto
    {
        [Required]
        [Range(0, int.MaxValue)]
        public int Quantity { get; set; }
    }
}