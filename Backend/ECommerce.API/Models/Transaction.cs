namespace ECommerce.API.Models
{
    public class Transaction
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public Order Order { get; set; } = null!;

        public string TransactionReference { get; set; }
            = string.Empty;

        public int PaymentMethodId { get; set; }

        public PaymentMethod PaymentMethod { get; set; }
            = null!;

        public PaymentStatus Status { get; set; }
            = PaymentStatus.Pending;

        public decimal Amount { get; set; }

        public string? GatewayTransactionId { get; set; }

        public string? GatewayResponse { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;
    }
}
