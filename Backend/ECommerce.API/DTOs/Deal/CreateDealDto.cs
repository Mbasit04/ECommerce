using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Deal
{
    public class CreateDealDto
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        [Range(0.01, 100)]
        public decimal DiscountPercentage { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }
    }
}