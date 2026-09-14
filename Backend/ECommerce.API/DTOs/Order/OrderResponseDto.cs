using ECommerce.API.Models;

namespace ECommerce.API.DTOs.Order
{
    public class OrderResponseDto
    {
        public int Id { get; set; }

        public int CustomerId { get; set; }

        public string? CustomerName { get; set; }

        public string? CustomerEmail { get; set; }

        public decimal SubTotal { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal ShippingAmount { get; set; }

        public decimal TotalAmount { get; set; }

        public OrderStatus Status { get; set; }

        public PaymentStatus PaymentStatus { get; set; }

        public string PaymentMethod { get; set; } = string.Empty;

        public string ShippingAddress { get; set; } = string.Empty;

        public string? City { get; set; }

        public string? PhoneNumber { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime OrderDate => CreatedAt;

        public List<OrderItemResponseDto> Items { get; set; } = new();
    }
}
