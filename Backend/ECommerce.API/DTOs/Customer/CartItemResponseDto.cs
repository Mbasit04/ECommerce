namespace ECommerce.API.DTOs.Customer
{
    public class CartItemResponseDto
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public string? ImageUrl { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal OriginalPrice { get; set; }

        public decimal DiscountPercentage { get; set; }

        public int Quantity { get; set; }

        public int Stock { get; set; }

        public decimal TotalPrice { get; set; }

        public bool IsStockValid { get; set; }

        public string StockMessage { get; set; } = string.Empty;
    }
}
