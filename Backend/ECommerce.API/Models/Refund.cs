namespace ECommerce.API.Models
{
    public class Refund
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public Order Order { get; set; } = null!;

        public int CustomerId { get; set; }

        public User Customer { get; set; } = null!;

        public decimal Amount { get; set; }

        public string Reason { get; set; }
            = string.Empty;

        public string Status { get; set; }
            = "Requested";

        public string PaymentMethod { get; set; }
            = string.Empty;

        public string? StripeRefundId { get; set; }

        public DateTime RequestedAt { get; set; }
            = DateTime.UtcNow;

        public DateTime? ProcessedAt { get; set; }
    }
}