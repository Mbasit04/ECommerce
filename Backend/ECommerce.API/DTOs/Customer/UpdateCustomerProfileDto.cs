using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Customer
{
    public class UpdateCustomerProfileDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [StringLength(30)]
        public string? Phone { get; set; }

        [StringLength(250)]
        public string? Address { get; set; }

        [StringLength(80)]
        public string? City { get; set; }
    }
}
