namespace ECommerce.API.DTOs.Seller
{
    public class SellerProfileResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; }
            = string.Empty;

        public string Email { get; set; }
            = string.Empty;

        public string Role { get; set; }
            = string.Empty;
    }
}