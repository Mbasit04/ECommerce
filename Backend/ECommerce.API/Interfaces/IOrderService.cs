using ECommerce.API.DTOs.Order;

namespace ECommerce.API.Interfaces
{
    public interface IOrderService
    {
        Task<OrderResponseDto> CreateAsync(
            CreateOrderDto dto,
            int customerId);

        Task<OrderResponseDto?> GetByIdAsync(
            int orderId,
            int customerId);

        Task<List<OrderResponseDto>> GetMyOrdersAsync(
            int customerId);

        Task<List<OrderResponseDto>> GetAllAsync();

        Task<OrderResponseDto?> GetByIdForAdminAsync(int orderId);

        Task<bool> UpdateStatusAsync(int orderId, string status, string? trackingNumber);
    }
}