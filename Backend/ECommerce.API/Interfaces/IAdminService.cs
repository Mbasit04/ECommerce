using ECommerce.API.DTOs.Admin;

namespace ECommerce.API.Interfaces
{
    public interface IAdminService
    {
        Task<AdminDashboardDto> GetDashboardAsync();

        Task<IEnumerable<object>> GetSellersAsync();

        Task<object?> GetSellerByIdAsync(int id);

        Task<object> CreateSellerAsync(CreateSellerDto dto);

        Task<object> UpdateSellerAsync(int id, UpdateSellerDto dto);

        Task<object> DeleteSellerAsync(int id);

        Task<IEnumerable<object>> GetCustomersAsync();

        Task<object?> GetCustomerByIdAsync(int id);

        Task<object> CreateCustomerAsync(CreateCustomerDto dto);

        Task<object> UpdateCustomerAsync(int id, UpdateCustomerDto dto);

        Task<object> DeleteCustomerAsync(int id);

        // =========================================================
        // SHIPPING MONITORING (Step 20.6)
        // =========================================================

        Task<List<AdminShippingDto>>
            GetAllShippingAsync();

        Task<AdminShippingDto?>
            GetShippingByOrderIdAsync(
                int orderId);

        // =========================================================
        // REFUND MANAGEMENT (Phase 22)
        // =========================================================

        Task<List<AdminRefundDto>>
            GetAllRefundsAsync();

        Task<AdminRefundDto?>
            GetRefundByIdAsync(int refundId);

        Task<bool> ApproveRefundAsync(int refundId);

        Task<bool> RejectRefundAsync(int refundId);
    }
}
