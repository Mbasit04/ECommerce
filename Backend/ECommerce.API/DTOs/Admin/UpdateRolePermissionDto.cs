using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.DTOs.Admin
{
    // Payload for changing a single matrix cell.
    public class UpdateRolePermissionDto
    {
        // The values rendered in the UI: allow, deny, own, read, write.
        // Stored verbatim — server enforces the allow-list, the rest is
        // surfaced as a friendly error.
        [Required]
        [StringLength(16)]
        public string Capability { get; set; } = "deny";
    }
}
