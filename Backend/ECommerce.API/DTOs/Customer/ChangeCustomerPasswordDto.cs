using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Customer
{
    public class ChangeCustomerPasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }
            = string.Empty;

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
            = string.Empty;

        [Required]
        [Compare(nameof(NewPassword))]
        public string ConfirmNewPassword { get; set; }
            = string.Empty;
    }
}
