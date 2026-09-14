using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Customer
{
    public class StartConversationDto
    {
        [Required]
        public int SellerId { get; set; }

        public int? ProductId { get; set; }

        [Required]
        [StringLength(1000)]
        public string Message { get; set; } = string.Empty;
    }
}