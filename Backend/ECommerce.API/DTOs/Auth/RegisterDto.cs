using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Auth
{
    public class RegisterDto
    {
        [Required]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Address { get; set; }

        // Role is optional for backwards compatibility — when omitted,
        // self-registration defaults to "Customer". Self-registration as
        // "Admin" is intentionally NOT allowed; only Customer and Seller
        // can be picked.
        public string? Role { get; set; }

        public string ResolvedRole =>
            string.IsNullOrWhiteSpace(Role) ? "Customer" : Role.Trim();

        public bool IsRoleAllowed()
        {
            var r = ResolvedRole;
            return r == "Customer" || r == "Seller";
        }
    }
}
