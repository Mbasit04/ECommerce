using ECommerce.API.Data;
using ECommerce.API.DTOs.Deal;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class DealService : IDealService
    {
        private readonly ApplicationDbContext _context;

        public DealService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DealResponseDto> CreateAsync(
            CreateDealDto dto,
            int userId,
            bool isAdmin)
        {
            if (dto.EndDate <= dto.StartDate)
            {
                throw new Exception(
                    "End date must be after start date.");
            }

            var product = await _context.Products
                .FirstOrDefaultAsync(x => x.Id == dto.ProductId);

            if (product == null)
            {
                throw new Exception("Product not found.");
            }

            if (!product.IsActive)
            {
                throw new Exception(
                    "Cannot create a deal for an inactive product.");
            }

            if (!isAdmin && product.SellerId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only create deals for your own products.");
            }

            var overlappingDeal = await _context.Deals
                .AnyAsync(x =>
                    x.ProductId == dto.ProductId &&
                    x.IsActive &&
                    dto.StartDate < x.EndDate &&
                    dto.EndDate > x.StartDate);

            if (overlappingDeal)
            {
                throw new Exception(
                    "This product already has an overlapping active deal.");
            }

            // Sellers almost always want a deal that goes live the moment
            // they click "Create". If the submitted StartDate is in the
            // very near future (under 2 minutes ahead), snap it to "now"
            // — otherwise the customer-facing product query (which filters
            // by "now >= StartDate") will silently hide the deal for those
            // few minutes, and the seller will think nothing happened.
            // Far-future starts (scheduled launches, Black Friday, etc.)
            // are left alone.
            var nowUtc = DateTime.UtcNow;
            var startDate = dto.StartDate;
            if (startDate > nowUtc && startDate <= nowUtc.AddMinutes(2))
            {
                startDate = nowUtc;
            }

            var deal = new Deal
            {
                ProductId = dto.ProductId,
                // Deals are owned by the product's seller. This is also
                // required by the Deals.SellerId foreign key when an admin
                // creates a deal on a seller's behalf.
                SellerId = product.SellerId,
                DiscountPercentage = dto.DiscountPercentage,
                StartDate = startDate,
                EndDate = dto.EndDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Deals.Add(deal);

            await _context.SaveChangesAsync();

            return await GetByIdAsync(deal.Id)
                   ?? throw new Exception(
                       "Unable to retrieve created deal.");
        }

        public async Task<List<DealResponseDto>> GetAllAsync()
        {
            var now = DateTime.UtcNow;

            return await _context.Deals
                .AsNoTracking()
                .Include(x => x.Product)
                .ThenInclude(x => x.Seller)
                .Select(x => new DealResponseDto
                {
                    Id = x.Id,

                    ProductId = x.ProductId,

                    ProductName = x.Product.Name,

                    OriginalPrice = x.Product.Price,

                    DiscountPercentage =
                        x.DiscountPercentage,

                    DiscountAmount =
                        x.Product.Price *
                        x.DiscountPercentage / 100,

                    DealPrice =
                        x.Product.Price -
                        (
                            x.Product.Price *
                            x.DiscountPercentage / 100
                        ),

                    StartDate = x.StartDate,

                    EndDate = x.EndDate,

                    IsActive = x.IsActive,

                    IsCurrentlyActive =
                        x.IsActive &&
                        x.StartDate <= now &&
                        x.EndDate >= now,

                    SellerId = x.Product.SellerId,

                    SellerName = x.Product.Seller.FullName
                })
                .OrderByDescending(x => x.Id)
                .ToListAsync();
        }

        public async Task<DealResponseDto?> GetByIdAsync(int id)
        {
            var now = DateTime.UtcNow;

            return await _context.Deals
                .AsNoTracking()
                .Include(x => x.Product)
                .ThenInclude(x => x.Seller)
                .Where(x => x.Id == id)
                .Select(x => new DealResponseDto
                {
                    Id = x.Id,

                    ProductId = x.ProductId,

                    ProductName = x.Product.Name,

                    OriginalPrice = x.Product.Price,

                    DiscountPercentage =
                        x.DiscountPercentage,

                    DiscountAmount =
                        x.Product.Price *
                        x.DiscountPercentage / 100,

                    DealPrice =
                        x.Product.Price -
                        (
                            x.Product.Price *
                            x.DiscountPercentage / 100
                        ),

                    StartDate = x.StartDate,

                    EndDate = x.EndDate,

                    IsActive = x.IsActive,

                    IsCurrentlyActive =
                        x.IsActive &&
                        x.StartDate <= now &&
                        x.EndDate >= now,

                    SellerId = x.Product.SellerId,

                    SellerName = x.Product.Seller.FullName
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateAsync(
            int id,
            UpdateDealDto dto,
            int userId,
            bool isAdmin)
        {
            if (dto.EndDate <= dto.StartDate)
            {
                throw new Exception(
                    "End date must be after start date.");
            }

            var deal = await _context.Deals
                .Include(x => x.Product)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (deal == null)
            {
                return false;
            }

            if (!isAdmin &&
                deal.Product.SellerId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only modify your own deals.");
            }

            var overlappingDeal = await _context.Deals
                .AnyAsync(x =>
                    x.Id != id &&
                    x.ProductId == deal.ProductId &&
                    x.IsActive &&
                    dto.StartDate < x.EndDate &&
                    dto.EndDate > x.StartDate);

            if (overlappingDeal)
            {
                throw new Exception(
                    "The new dates overlap another active deal.");
            }

            deal.DiscountPercentage =
                dto.DiscountPercentage;

            // Same near-future clamp as in CreateAsync — keeps updates
            // consistent: editing a deal never lands it in a brief,
            // invisible "upcoming" state from the customer's point of
            // view.
            var updateNowUtc = DateTime.UtcNow;
            var newStart = dto.StartDate;
            if (newStart > updateNowUtc &&
                newStart <= updateNowUtc.AddMinutes(2))
            {
                newStart = updateNowUtc;
            }

            deal.StartDate = newStart;

            deal.EndDate = dto.EndDate;

            deal.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteAsync(
            int id,
            int userId,
            bool isAdmin)
        {
            var deal = await _context.Deals
                .Include(x => x.Product)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (deal == null)
            {
                return false;
            }

            if (!isAdmin &&
                deal.Product.SellerId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only delete your own deals.");
            }

            _context.Deals.Remove(deal);

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> ToggleActiveAsync(
            int id,
            int userId,
            bool isAdmin)
        {
            var deal = await _context.Deals
                .Include(x => x.Product)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (deal == null)
            {
                return false;
            }

            if (!isAdmin &&
                deal.Product.SellerId != userId)
            {
                throw new UnauthorizedAccessException(
                    "You can only modify your own deals.");
            }

            deal.IsActive = !deal.IsActive;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
