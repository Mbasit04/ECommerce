using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Product
{
    public class CreateProductDto
    {
        [Required]
        [StringLength(150, MinimumLength = 2,
            ErrorMessage = "Product name must be between 2 and 150 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(2000,
            ErrorMessage = "Description cannot exceed 2000 characters.")]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, 999999999,
            ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; }

        [Required]
        [Range(0, 100000000,
            ErrorMessage = "Stock cannot be negative.")]
        public int Stock { get; set; }

        public string? ImageUrl { get; set; }

        [Range(1, int.MaxValue,
            ErrorMessage = "Please select a valid category.")]
        public int CategoryId { get; set; }

        [Required]
        public int SellerId { get; set; }
    }
}
