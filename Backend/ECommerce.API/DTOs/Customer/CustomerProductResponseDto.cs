namespace ECommerce.API.DTOs.Customer
{
    public class CustomerProductResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public decimal Price { get; set; }

        public int Stock { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; }
            = string.Empty;

        public int SellerId { get; set; }

        public string SellerName { get; set; }
            = string.Empty;

        public bool HasActiveDeal { get; set; }

        public decimal? DiscountPercentage { get; set; }

        public decimal FinalPrice { get; set; }
    }
}
