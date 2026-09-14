namespace ECommerce.API.DTOs.Seller
{
    public class SellerStockResponseDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public int StockChange { get; set; }
        public int NewStock { get; set; }
        public string Action { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }
}