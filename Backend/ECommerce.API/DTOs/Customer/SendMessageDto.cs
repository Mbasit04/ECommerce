using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Customer
{
    public class SendMessageDto
    {
        [Required]
        [StringLength(1000)]
        public string Message { get; set; } = string.Empty;
    }
}