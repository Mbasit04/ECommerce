namespace ECommerce.API.DTOs.Admin
{
    // Single row of the "users in a role" table. Used by the
    // Admin Role Permissions page to show who currently holds a role
    // and to feed the "change role" dropdown.
    public class RoleUserDto
    {
        public int UserId { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
