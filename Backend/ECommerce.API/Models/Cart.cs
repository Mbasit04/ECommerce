using System.ComponentModel.DataAnnotations.Schema;

namespace ECommerce.API.Models
{
    public class Cart
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public User Customer { get; set; } = null!;

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;

        [NotMapped]
        public DateTime UpdatedAt { get; set; }
            = DateTime.UtcNow;

        public ICollection<CartItem> CartItems { get; set; }
            = new List<CartItem>();
    }
}