namespace ECommerce.API.DTOs.Seller
{
    // Review row scoped to a single seller's products. The sellerId check
    // happens server-side; the UI just renders the rows it gets back.
    public class SellerReviewDto
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
