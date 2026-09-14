using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Product
{
    public class UpdateProductDto
    {
        [Required]
        [StringLength(150, MinimumLength = 2,
            ErrorMessage = "Product name must be between 2 and 150 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        [Range(0.01, 999999999,
            ErrorMessage = "Price must be greater than 0.")]
        public decimal Price { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        public string? ImageUrl { get; set; }

        [Range(1, int.MaxValue,
            ErrorMessage = "Please select a valid category.")]
        public int CategoryId { get; set; }

        public bool IsActive { get; set; }
    }
}
