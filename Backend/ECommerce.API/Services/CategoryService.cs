using ECommerce.API.Data;
using ECommerce.API.DTOs.Category;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;

        public CategoryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Category>> GetAllAsync()
        {
            return await _context.Categories
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .ToListAsync();
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Category> CreateAsync(CreateCategoryDto dto)
        {
            var exists = await _context.Categories
                .AnyAsync(x => x.Name.ToLower() == dto.Name.ToLower());

            if (exists)
            {
                throw new Exception("Category already exists.");
            }

            var category = new Category
            {
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);

            await _context.SaveChangesAsync();

            return category;
        }

        public async Task<bool> UpdateAsync(
            int id,
            UpdateCategoryDto dto)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(x => x.Id == id);

            if (category == null)
            {
                return false;
            }

            var duplicate = await _context.Categories
                .AnyAsync(x =>
                    x.Id != id &&
                    x.Name.ToLower() == dto.Name.ToLower());

            if (duplicate)
            {
                throw new Exception("Another category with this name already exists.");
            }

            category.Name = dto.Name.Trim();
            category.Description = dto.Description?.Trim();
            category.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _context.Categories
                .Include(x => x.Products)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (category == null)
            {
                return false;
            }

            if (category.Products.Any())
            {
                throw new Exception(
                    "This category cannot be deleted because products are assigned to it.");
            }

            _context.Categories.Remove(category);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}