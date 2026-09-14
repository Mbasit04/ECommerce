using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Seller
{
    public class UpdateDealDto
    {
        [Required]
        public int ProductId { get; set; }

        [Range(0.01, 99.99)]
        public decimal DiscountPercentage { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; }
    }
}
