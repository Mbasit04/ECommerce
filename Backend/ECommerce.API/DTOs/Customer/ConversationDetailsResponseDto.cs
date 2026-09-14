namespace ECommerce.API.DTOs.Customer
{
    public class ConversationDetailsResponseDto
    {
        public int ConversationId { get; set; }

        public int SellerId { get; set; }

        public string SellerName { get; set; } = string.Empty;

        public int? ProductId { get; set; }

        public string? ProductName { get; set; }

        public List<MessageResponseDto> Messages { get; set; }
            = new();
    }
}