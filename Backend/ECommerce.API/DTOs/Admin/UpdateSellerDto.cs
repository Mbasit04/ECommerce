using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Admin
{
    public class UpdateSellerDto
    {
        public string? Name { get; set; }

        public string? FullName { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public bool? IsActive { get; set; }
    }
}
