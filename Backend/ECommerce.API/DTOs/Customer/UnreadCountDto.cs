namespace ECommerce.API.DTOs.Customer
{
    // Lightweight unread-count response used by the navbar badge and
    // the conversation list.
    public class UnreadCountDto
    {
        public int UnreadCount { get; set; }
    }
}
