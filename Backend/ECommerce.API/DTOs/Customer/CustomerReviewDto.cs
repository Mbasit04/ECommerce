namespace ECommerce.API.DTOs.Customer
{
    // Slightly richer than FeedbackResponseDto — includes the customer name
    // so the UI can render "Ali · ★★★★★" instead of "Customer".
    public class CustomerReviewDto
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public int CustomerId { get; set; }

        public string CustomerName { get; set; } = string.Empty;

        public int Rating { get; set; }

        public string Comment { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }
    }
}
