using System.ComponentModel.DataAnnotations;

namespace ECommerce.API.Models
{
    // One cell of the role-permission matrix. (Role, Module) is unique
    // — there's at most one row per role/module pair. The Capability
    // value drives what the badge renders as on the admin page.
    public class RolePermission
    {
        public int Id { get; set; }

        public int RoleId { get; set; }

        public Role? Role { get; set; }

        [Required]
        [StringLength(64)]
        public string ModuleKey { get; set; } = string.Empty;

        // Stored as a string so admin can introduce new capability
        // values ("deny", "allow", "own", "read", "write") without a
        // schema change. Validated server-side against the allow-list.
        [Required]
        [StringLength(16)]
        public string Capability { get; set; } = "deny";

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
