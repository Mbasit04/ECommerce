namespace ECommerce.API.Models
{
    public class Message
    {
        public int Id { get; set; }

        public int ConversationId { get; set; }

        public Conversation Conversation { get; set; } = null!;

        public int SenderId { get; set; }

        public User Sender { get; set; } = null!;

        public int ReceiverId { get; set; }

        public User Receiver { get; set; } = null!;

        public string MessageText { get; set; } = string.Empty;

        public bool IsRead { get; set; } = false;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}