namespace ECommerce.API.DTOs.Customer
{
    public class MessageResponseDto
    {
        public int MessageId { get; set; }

        public int SenderId { get; set; }

        public int ReceiverId { get; set; }

        public string Message { get; set; } = string.Empty;

        public bool IsRead { get; set; }

        public DateTime SentAt { get; set; }
    }
}