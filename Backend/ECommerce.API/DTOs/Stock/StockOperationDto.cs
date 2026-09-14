using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Stock
{
    public class StockOperationDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        [StringLength(500)]
        public string? Reason { get; set; }
    }
}