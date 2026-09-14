using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Seller
{
    public class CreateSellerProductDto
    {
        [Required]
        [StringLength(150, MinimumLength = 2,
            ErrorMessage = "Product name must be between 2 and 150 characters.")]
        public string Name { get; set; } = string.Empty;

        [StringLength(2000,
            ErrorMessage = "Description cannot exceed 2000 characters.")]
        public string Description { get; set; } = string.Empty;

        [Required]
        [StringLength(8000000)]
        public string ImageUrl { get; set; } = string.Empty;

        [Range(0.01, 999999999)]
        public decimal Price { get; set; }

        [Range(0, int.MaxValue)]
        public int Stock { get; set; }

        [Range(1, int.MaxValue,
            ErrorMessage = "Please select a valid category.")]
        public int CategoryId { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
