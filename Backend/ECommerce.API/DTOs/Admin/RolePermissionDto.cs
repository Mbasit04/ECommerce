namespace ECommerce.API.DTOs.Admin
{
    // One flat row of the role-permission matrix. The frontend consumes
    // a list of these and reshapes into a (modules × roles) grid.
    public class RolePermissionDto
    {
        public int Id { get; set; }

        public int RoleId { get; set; }

        public string RoleName { get; set; } = string.Empty;

        public string ModuleKey { get; set; } = string.Empty;

        // One of: "allow", "deny", "own", "read", "write".
        public string Capability { get; set; } = "deny";

        public DateTime UpdatedAt { get; set; }
    }
}
