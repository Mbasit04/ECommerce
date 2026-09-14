namespace ECommerce.API.Models
{
    public class Feedback
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public Product Product { get; set; } = null!;

        public int CustomerId { get; set; }

        public User Customer { get; set; } = null!;

        public int OrderId { get; set; }

        public Order Order { get; set; } = null!;

        public int Rating { get; set; }

        public string Comment { get; set; }
            = string.Empty;

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }
    }
}