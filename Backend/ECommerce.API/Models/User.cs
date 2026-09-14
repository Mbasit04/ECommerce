namespace ECommerce.API.Models
{
    public class User
    {
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string PasswordHash { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<UserRole> UserRoles { get; set; }
            = new List<UserRole>();

        public ICollection<Product> Products { get; set; }
            = new List<Product>();

        public ICollection<Order> Orders { get; set; }
            = new List<Order>();
    }
}
