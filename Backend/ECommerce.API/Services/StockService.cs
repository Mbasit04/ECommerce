using ECommerce.API.Data;
using ECommerce.API.DTOs.Stock;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class StockService : IStockService
    {
        private readonly ApplicationDbContext _context;

        public StockService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int?> AddStockAsync(
            int productId,
            StockOperationDto dto,
            int userId,
            bool isAdmin)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(x => x.Id == productId);

            if (product == null)
            {
                return null;
            }

            if (!isAdmin && product.SellerId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only modify stock for your own products.");
            }

            var previousStock = product.Stock;
            product.Stock += dto.Quantity;

            var movement = new StockMovement
            {
                ProductId = product.Id,
                SellerId = product.SellerId,
                UserId = userId,
                PreviousQuantity = previousStock,
                NewQuantity = product.Stock,
                QuantityChanged = dto.Quantity,
                Quantity = dto.Quantity,
                Type = "ADD",
                Reason = dto.Reason,
                CreatedAt = DateTime.UtcNow
            };

            _context.StockMovements.Add(movement);

            await _context.SaveChangesAsync();

            return product.Stock;
        }

        public async Task<int?> RemoveStockAsync(
            int productId,
            StockOperationDto dto,
            int userId,
            bool isAdmin)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(x => x.Id == productId);

            if (product == null)
            {
                return null;
            }

            if (!isAdmin && product.SellerId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only modify stock for your own products.");
            }

            if (product.Stock < dto.Quantity)
            {
                throw new Exception(
                    "Insufficient stock.");
            }

            var previousStock = product.Stock;
            product.Stock -= dto.Quantity;

            var movement = new StockMovement
            {
                ProductId = product.Id,
                SellerId = product.SellerId,
                UserId = userId,
                PreviousQuantity = previousStock,
                NewQuantity = product.Stock,
                QuantityChanged = -dto.Quantity,
                Quantity = dto.Quantity,
                Type = "REMOVE",
                Reason = dto.Reason,
                CreatedAt = DateTime.UtcNow
            };

            _context.StockMovements.Add(movement);

            await _context.SaveChangesAsync();

            return product.Stock;
        }

        public async Task<List<StockMovementResponseDto>>
            GetMovementsAsync(
                int productId,
                int userId,
                bool isAdmin)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(x => x.Id == productId);

            if (product == null)
            {
                throw new Exception("Product not found.");
            }

            if (!isAdmin && product.SellerId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only view stock history for your own products.");
            }

            return await _context.StockMovements
                .AsNoTracking()
                .Include(x => x.Product)
                .Include(x => x.User)
                .Where(x => x.ProductId == productId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new StockMovementResponseDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product.Name,
                    UserId = x.UserId,
                    UserName = x.User.FullName,
                    Quantity = x.Quantity,
                    Type = x.Type,
                    Reason = x.Reason,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<List<AdminStockDto>> GetAdminStocksAsync()
        {
            return await _context.Products
                .AsNoTracking()
                .Include(x => x.Seller)
                .Select(x => new AdminStockDto
                {
                    Id = x.Id,
                    ProductId = x.Id,
                    ProductName = x.Name,
                    SellerName = x.Seller != null ? (x.Seller.FullName ?? x.Seller.Email) : "-",
                    Price = x.Price,
                    Stock = x.Stock,
                    IsActive = x.IsActive
                })
                .ToListAsync();
        }

        public async Task<List<StockMovementResponseDto>> GetAdminStockHistoryAsync(int productId)
        {
            return await _context.StockMovements
                .AsNoTracking()
                .Include(x => x.Product)
                .Include(x => x.User)
                .Where(x => x.ProductId == productId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new StockMovementResponseDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product.Name,
                    UserId = x.UserId,
                    UserName = x.User != null ? (x.User.FullName ?? x.User.Email) : "-",
                    Quantity = x.Quantity,
                    Type = x.Type,
                    Reason = x.Reason,
                    CreatedAt = x.CreatedAt
                })
                .ToListAsync();
        }
    }
}