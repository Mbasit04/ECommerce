using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Deal
{
    public class UpdateDealDto
    {
        [Required]
        [Range(0.01, 100)]
        public decimal DiscountPercentage { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; }
    }
}