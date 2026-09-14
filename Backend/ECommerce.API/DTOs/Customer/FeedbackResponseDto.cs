namespace ECommerce.API.DTOs.Customer
{
    public class FeedbackResponseDto
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; }
            = string.Empty;

        public int Rating { get; set; }

        public string Comment { get; set; }
            = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}