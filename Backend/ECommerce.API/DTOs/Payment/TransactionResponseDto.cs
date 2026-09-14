using ECommerce.API.Models;

namespace ECommerce.API.DTOs.Payment
{
    public class TransactionResponseDto
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public string TransactionReference { get; set; }
            = string.Empty;

        public PaymentMethod PaymentMethod { get; set; }
            = null!;

        public PaymentStatus Status { get; set; }

        public decimal Amount { get; set; }

        public string? GatewayTransactionId { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
