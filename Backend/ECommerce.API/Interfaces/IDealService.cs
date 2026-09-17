using ECommerce.API.DTOs.Deal;

namespace ECommerce.API.Interfaces
{
    public interface IDealService
    {
        Task<DealResponseDto> CreateAsync(
            CreateDealDto dto,
            int userId,
            bool isAdmin);

        Task<List<DealResponseDto>> GetAllAsync();

        Task<DealResponseDto?> GetByIdAsync(int id);

        Task<bool> UpdateAsync(
            int id,
            UpdateDealDto dto,
            int userId,
            bool isAdmin);

        Task<bool> DeleteAsync(
            int id,
            int userId,
            bool isAdmin);

        Task<bool> ToggleActiveAsync(
            int id,
            int userId,
            bool isAdmin);
    }
}