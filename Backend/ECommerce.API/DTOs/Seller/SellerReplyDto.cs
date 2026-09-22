using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Seller
{
    // Reply payload — seller is identified by JWT, the customerId/productId
    // here identify which thread the message lands in.
    public class SellerReplyDto
    {
        [Required]
        public int CustomerId { get; set; }

        public int? ProductId { get; set; }

        [Required]
        [StringLength(1000)]
        public string MessageText { get; set; } = string.Empty;
    }
}
