using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Customer
{
    public class RefundRequestDto
    {
        [Required]
        [StringLength(500)]
        public string Reason { get; set; }
            = string.Empty;
    }
}