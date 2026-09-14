using ECommerce.API.DTOs.Stock;

namespace ECommerce.API.Interfaces
{
    public interface IStockService
    {
        Task<int?> AddStockAsync(
            int productId,
            StockOperationDto dto,
            int userId,
            bool isAdmin);

        Task<int?> RemoveStockAsync(
            int productId,
            StockOperationDto dto,
            int userId,
            bool isAdmin);

        Task<List<StockMovementResponseDto>> GetMovementsAsync(
            int productId,
            int userId,
            bool isAdmin);

        Task<List<AdminStockDto>> GetAdminStocksAsync();

        Task<List<StockMovementResponseDto>> GetAdminStockHistoryAsync(int productId);
    }
}