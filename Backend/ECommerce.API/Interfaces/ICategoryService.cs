using ECommerce.API.DTOs.Category;
using ECommerce.API.Models;

namespace ECommerce.API.Interfaces
{
    public interface ICategoryService
    {
        Task<List<Category>> GetAllAsync();

        Task<Category?> GetByIdAsync(int id);

        Task<Category> CreateAsync(CreateCategoryDto dto);

        Task<bool> UpdateAsync(int id, UpdateCategoryDto dto);

        Task<bool> DeleteAsync(int id);
    }
}