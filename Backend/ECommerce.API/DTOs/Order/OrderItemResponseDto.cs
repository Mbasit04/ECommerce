namespace ECommerce.API.DTOs.Order
{
    public class OrderItemResponseDto
    {
        public int ProductId { get; set; }

        public string ProductName { get; set; }
            = string.Empty;

        public int Quantity { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal TotalPrice { get; set; }
    }
}