using ECommerce.API.Data;
using ECommerce.API.DTOs.Product;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class ProductService : IProductService
    {
        private readonly ApplicationDbContext _context;

        public ProductService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductResponseDto>> GetAllAsync()
        {
            return await _context.Products
                .AsNoTracking()
                .Include(x => x.Category)
                .Include(x => x.Seller)
                .Select(x => new ProductResponseDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    Price = x.Price,
                    Stock = x.Stock,
                    ImageUrl = x.ImageUrl,
                    IsActive = x.IsActive,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category.Name,
                    SellerId = x.SellerId,
                    SellerName = x.Seller.FullName,
                    CreatedAt = x.CreatedAt
                })
                .OrderByDescending(x => x.Id)
                .ToListAsync();
        }

        public async Task<ProductResponseDto?> GetByIdAsync(int id)
        {
            return await _context.Products
                .AsNoTracking()
                .Include(x => x.Category)
                .Include(x => x.Seller)
                .Where(x => x.Id == id)
                .Select(x => new ProductResponseDto
                {
                    Id = x.Id,
                    Name = x.Name,
                    Description = x.Description,
                    Price = x.Price,
                    Stock = x.Stock,
                    ImageUrl = x.ImageUrl,
                    IsActive = x.IsActive,
                    CategoryId = x.CategoryId,
                    CategoryName = x.Category.Name,
                    SellerId = x.SellerId,
                    SellerName = x.Seller.FullName,
                    CreatedAt = x.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<ProductResponseDto> CreateAsync(
            CreateProductDto dto)
        {
            var categoryExists = await _context.Categories
                .AnyAsync(x =>
                    x.Id == dto.CategoryId &&
                    x.IsActive);

            if (!categoryExists)
            {
                throw new Exception(
                    "Category does not exist or is inactive.");
            }

            var sellerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Seller");

            if (sellerRole == null)
            {
                throw new Exception("Seller role does not exist.");
            }

            var sellerExists = await _context.UserRoles
                .AnyAsync(x =>
                    x.UserId == dto.SellerId &&
                    x.RoleId == sellerRole.Id);

            if (!sellerExists)
            {
                throw new Exception(
                    "Selected user is not a Seller.");
            }

            var product = new Product
            {
                Name = dto.Name.Trim(),
                Description = dto.Description?.Trim(),
                Price = dto.Price,
                Stock = dto.Stock,
                ImageUrl = dto.ImageUrl,
                CategoryId = dto.CategoryId,
                SellerId = dto.SellerId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);

            await _context.SaveChangesAsync();

            var result = await GetByIdAsync(product.Id);

            return result!;
        }

        public async Task<bool> UpdateAsync(
            int id,
            UpdateProductDto dto)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(x => x.Id == id);

            if (product == null)
            {
                return false;
            }

            var categoryExists = await _context.Categories
                .AnyAsync(x =>
                    x.Id == dto.CategoryId &&
                    x.IsActive);

            if (!categoryExists)
            {
                throw new Exception(
                    "Category does not exist or is inactive.");
            }

            product.Name = dto.Name.Trim();
            product.Description = dto.Description?.Trim();
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.ImageUrl = dto.ImageUrl;
            product.CategoryId = dto.CategoryId;
            product.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(x => x.Id == id);

            if (product == null)
            {
                return false;
            }

            _context.Products.Remove(product);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}