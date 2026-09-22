namespace ECommerce.API.DTOs.Seller
{
    // Full conversation thread from the seller's POV — same shape as the
    // customer's but with the customer identified instead of the seller.
    public class SellerMessageDetailsDto
    {
        public int ConversationId { get; set; }

        public int CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public int SellerId { get; set; }

        public int? ProductId { get; set; }

        public string? ProductName { get; set; }

        public List<SellerMessageDto> Messages { get; set; } = new();
    }
}
