namespace ECommerce.API.Models
{
    public class Payment
    {

        public int Id { get; set; }

        public int OrderId { get; set; }

        public Order Order { get; set; } = null!;

        public int PaymentMethodId { get; set; }

        public PaymentMethod PaymentMethod { get; set; } = null!;

        public decimal Amount { get; set; }

        public string? TransactionId { get; set; }

        public string PaymentStatus { get; set; } = "Pending";

        public DateTime? PaidAt { get; set; }
    }
}
