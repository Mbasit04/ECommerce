namespace ECommerce.API.DTOs.Admin
{
    public class AdminShippingDto
    {
        public int OrderId { get; set; }

        public string CustomerName { get; set; }
            = string.Empty;

        public string ShippingAddress { get; set; }
            = string.Empty;

        public string City { get; set; }
            = string.Empty;

        public string PhoneNumber { get; set; }
            = string.Empty;

        public string? TrackingNumber { get; set; }

        public string OrderStatus { get; set; }
            = string.Empty;

        public DateTime? ShippedAt { get; set; }

        public DateTime? DeliveredAt { get; set; }
    }
}
