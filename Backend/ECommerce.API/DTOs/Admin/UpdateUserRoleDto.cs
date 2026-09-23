using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Admin
{
    // Payload for the "change this user's role" action. The frontend
    // sends the new role id; the backend enforces that it exists.
    public class UpdateUserRoleDto
    {
        [Required]
        public int RoleId { get; set; }
    }
}
