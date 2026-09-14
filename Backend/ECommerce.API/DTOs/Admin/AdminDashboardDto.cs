namespace ECommerce.API.DTOs.Admin
{
    public class AdminDashboardDto
    {
        public int TotalUsers { get; set; }

        public int TotalSellers { get; set; }

        public int TotalCustomers { get; set; }

        public int TotalProducts { get; set; }

        public int TotalCategories { get; set; }

        public int TotalOrders { get; set; }

        public decimal TotalRevenue { get; set; }

        public int PendingOrders { get; set; }
    }
}