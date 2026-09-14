using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Seller
{
    public class UpdateSellerStockDto
    {
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [Required]
        [StringLength(500)]
        public string Reason { get; set; } = string.Empty;
    }
}