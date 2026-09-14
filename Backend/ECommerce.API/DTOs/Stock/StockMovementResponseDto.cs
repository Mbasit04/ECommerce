namespace ECommerce.API.DTOs.Stock
{
    public class StockMovementResponseDto
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public int UserId { get; set; }

        public string UserName { get; set; } = string.Empty;

        public int Quantity { get; set; }

        public string Type { get; set; } = string.Empty;

        public string? Reason { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}