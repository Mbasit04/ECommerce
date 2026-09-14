namespace ECommerce.API.DTOs.Seller
{
    public class SellerProductResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; }
            = string.Empty;

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public decimal Price { get; set; }

        public int Stock { get; set; }

        public bool IsActive { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; }
            = string.Empty;
    }
}
