namespace ECommerce.API.DTOs.Customer
{
    public class OrderResponseDto
    {
        public int OrderId { get; set; }

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; }
            = string.Empty;

        public string ShippingAddress { get; set; }
            = string.Empty;

        public string PaymentMethod { get; set; }
            = string.Empty;

        public string? TrackingNumber { get; set; }

        public List<OrderItemResponseDto> Items { get; set; }
            = new List<OrderItemResponseDto>();
    }
}