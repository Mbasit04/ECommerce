namespace ECommerce.API.DTOs.Deal
{
    public class DealResponseDto
    {
        public int Id { get; set; }

        public int ProductId { get; set; }

        public string ProductName { get; set; } = string.Empty;

        public decimal OriginalPrice { get; set; }

        public decimal DiscountPercentage { get; set; }

        public decimal DiscountAmount { get; set; }

        public decimal DealPrice { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; }

        public bool IsCurrentlyActive { get; set; }

        public int SellerId { get; set; }

        public string SellerName { get; set; } = string.Empty;
    }
}