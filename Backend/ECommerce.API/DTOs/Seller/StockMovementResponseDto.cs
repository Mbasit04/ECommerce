namespace ECommerce.API.DTOs.Seller
{
    public class StockMovementResponseDto
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; }
            = string.Empty;

        public int PreviousQuantity { get; set; }

        public int NewQuantity { get; set; }

        public int QuantityChanged { get; set; }

        public string Reason { get; set; }
            = string.Empty;

        public DateTime CreatedAt { get; set; }
    }
}