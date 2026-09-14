using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Admin
{
    public class CreateCustomerDto
    {
        private string _fullName = string.Empty;

        public string FullName
        {
            get => !string.IsNullOrWhiteSpace(_fullName) ? _fullName : Name;
            set => _fullName = value;
        }

        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Address { get; set; }
    }
}