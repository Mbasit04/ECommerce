namespace ECommerce.API.DTOs.Seller
{
    // Single message bubble inside a seller conversation thread.
    public class SellerMessageDto
    {
        public int MessageId { get; set; }

        public int SenderId { get; set; }

        public string SenderName { get; set; } = string.Empty;

        public int ReceiverId { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime SentAt { get; set; }
    }
}
