namespace ECommerce.API.DTOs.Customer
{
    public class RefundResponseDto
    {
        public int RefundId { get; set; }

        public int OrderId { get; set; }

        public decimal Amount { get; set; }

        public string Reason { get; set; }
            = string.Empty;

        public string Status { get; set; }
            = string.Empty;

        public string PaymentMethod { get; set; }
            = string.Empty;

        public string? StripeRefundId { get; set; }

        public DateTime RequestedAt { get; set; }

        public DateTime? ProcessedAt { get; set; }
    }
}