namespace ECommerce.API.Models
{
    public class Shipping
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public Order Order { get; set; } = null!;

        public string Address { get; set; } = string.Empty;

        public string City { get; set; } = string.Empty;

        public string? TrackingNumber { get; set; }

        public string? CourierName { get; set; }

        public string ShippingStatus { get; set; } = "Pending";

        public DateTime? ShippedAt { get; set; }

        public DateTime? DeliveredAt { get; set; }

        public DateTime? EstimatedDelivery { get; set; }
    }
}
