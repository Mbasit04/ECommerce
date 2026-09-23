namespace ECommerce.API.DTOs.Admin
{
    // One row of the "Roles" panel on the admin Role Permissions page.
    // Includes the role name + how many users currently hold it.
    public class RoleSummaryDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public int UserCount { get; set; }

        public string? Description { get; set; }
    }
}
