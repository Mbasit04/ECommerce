namespace ECommerce.API.DTOs.Customer
{
    public class CartResponseDto
    {
        public int CartId { get; set; }

        public List<CartItemResponseDto> Items { get; set; } = new();

        public int TotalItems { get; set; }

        public decimal TotalAmount { get; set; }

        public bool IsValid { get; set; } = true;

        public List<string> ValidationMessages { get; set; } = new();
    }
}