namespace ECommerce.API.DTOs.Seller
{
    public class SellerOrderResponseDto
    {
        public int OrderId { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; }
            = string.Empty;

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal TotalPrice { get; set; }

        public DateTime OrderDate { get; set; }

        public string Status { get; set; }
            = string.Empty;

        public string? ShippingAddress { get; set; }

        public string? TrackingNumber { get; set; }

        public DateTime? ShippedAt { get; set; }

        public DateTime? DeliveredAt { get; set; }

        public string PaymentMethodType { get; set; }
            = "COD";

        public string PaymentStatus { get; set; }
            = "Pending";

        public DateTime? PaidAt { get; set; }
    }
}