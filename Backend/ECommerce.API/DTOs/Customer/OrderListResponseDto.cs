namespace ECommerce.API.DTOs.Customer
{
    public class OrderListResponseDto
    {
        public int OrderId { get; set; }

        public DateTime OrderDate { get; set; }

        public decimal TotalAmount { get; set; }

        public string Status { get; set; }
            = string.Empty;

        public string PaymentMethod { get; set; }
            = string.Empty;

        public int TotalItems { get; set; }
    }
}