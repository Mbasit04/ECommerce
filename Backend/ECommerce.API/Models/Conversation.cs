namespace ECommerce.API.Models
{
    public class Conversation
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }
        public User Customer { get; set; } = null!;

        public int SellerId { get; set; }
        public User Seller { get; set; } = null!;

        // Customer may contact seller about a specific product
        public int? ProductId { get; set; }
        public Product? Product { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public ICollection<Message> Messages { get; set; }
            = new List<Message>();
    }
}