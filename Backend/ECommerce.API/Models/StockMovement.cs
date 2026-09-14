namespace ECommerce.API.Models
{
    public class StockMovement
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public Product Product { get; set; } = null!;

        public int SellerId { get; set; }

        public User Seller { get; set; } = null!;

        public int PreviousQuantity { get; set; }

        public int NewQuantity { get; set; }

        public int QuantityChanged { get; set; }

        public string Reason { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int UserId { get; set; }

        public int Quantity { get; set; }

        public string Type { get; set; } = string.Empty;

        public User User { get; set; } = null!;
    }
}
