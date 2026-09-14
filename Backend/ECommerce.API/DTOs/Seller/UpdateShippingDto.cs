using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Seller
{
    public class UpdateShippingDto
    {
        [Required]
        public string Status { get; set; }
            = string.Empty;

        [StringLength(100)]
        public string? TrackingNumber { get; set; }
    }
}