namespace ECommerce.API.DTOs.Seller
{
    // Single row in the seller's "Conversations" list.
    // Mirrors the customer ConversationListResponseDto but with the
    // roles flipped — seller is the recipient, customer is the contact.
    public class SellerMessageConversationDto
    {
        public int ConversationId { get; set; }

        public int CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public int? ProductId { get; set; }

        public string? ProductName { get; set; }

        public string? LastMessage { get; set; }

        public DateTime? LastMessageAt { get; set; }

        public int UnreadCount { get; set; }
    }
}
