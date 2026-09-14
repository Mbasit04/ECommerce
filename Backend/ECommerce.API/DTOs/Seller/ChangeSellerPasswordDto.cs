using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Seller
{
    public class ChangeSellerPasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }
            = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
            = string.Empty;
    }
}