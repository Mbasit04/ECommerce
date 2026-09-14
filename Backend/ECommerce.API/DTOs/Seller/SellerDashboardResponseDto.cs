namespace ECommerce.API.DTOs.Seller
{
    public class SellerDashboardResponseDto
    {
        public int TotalProducts { get; set; }

        public int TotalOrders { get; set; }

        public int PendingOrders { get; set; }

        public decimal TotalSales { get; set; }

        public int TotalStock { get; set; }
    }
}