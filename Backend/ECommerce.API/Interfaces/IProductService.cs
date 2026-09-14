using ECommerce.API.DTOs.Product;

namespace ECommerce.API.Interfaces
{
    public interface IProductService
    {
        Task<List<ProductResponseDto>> GetAllAsync();

        Task<ProductResponseDto?> GetByIdAsync(int id);

        Task<ProductResponseDto> CreateAsync(
            CreateProductDto dto);

        Task<bool> UpdateAsync(
            int id,
            UpdateProductDto dto);

        Task<bool> DeleteAsync(int id);
    }
}