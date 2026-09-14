namespace ECommerce.API.DTOs.Customer
{
    public class CustomerProfileResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        public string? Phone { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string Role { get; set; } = "Customer";
    }
}
