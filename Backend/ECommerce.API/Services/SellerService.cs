using ECommerce.API.Data;
using ECommerce.API.DTOs.Seller;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class SellerService : ISellerService
    {
        private readonly ApplicationDbContext _context;

        public SellerService(
            ApplicationDbContext context)
        {
            _context = context;
        }


        // =========================================================
        // ADD PRODUCT
        // =========================================================

        public async Task<SellerProductResponseDto>
            AddProductAsync(
                CreateSellerProductDto dto,
                int sellerId)
        {
            var categoryExists =
                await _context.Categories
                    .AnyAsync(x =>
                        x.Id == dto.CategoryId);

            if (!categoryExists)
            {
                throw new Exception(
                    "Category does not exist.");
            }

            var product = new Product
            {
                Name = dto.Name.Trim(),

                Description =
                    dto.Description?.Trim(),

                ImageUrl = dto.ImageUrl.Trim(),

                Price = dto.Price,

                Stock = dto.Stock,

                CategoryId = dto.CategoryId,

                SellerId = sellerId,

                IsActive = true
            };

            _context.Products.Add(product);

            await _context.SaveChangesAsync();

            if (product.Stock > 0)
            {
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = product.Id,
                    SellerId = sellerId,
                    UserId = sellerId,
                    Quantity = product.Stock,
                    Type = "ADD",
                    PreviousQuantity = 0,
                    NewQuantity = product.Stock,
                    QuantityChanged = product.Stock,
                    Reason = "Initial stock",
                    CreatedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
            }

            return await GetMyProductByIdAsync(
                product.Id,
                sellerId)
                ?? throw new Exception(
                    "Product could not be created.");
        }


        // =========================================================
        // GET SELLER PRODUCTS
        // =========================================================

        public async Task<List<SellerProductResponseDto>>
            GetMyProductsAsync(
                int sellerId)
        {
            return await _context.Products
                .AsNoTracking()
                .Where(x =>
                    x.SellerId == sellerId)
                .OrderByDescending(x => x.Id)
                .Select(x =>
                    new SellerProductResponseDto
                    {
                        Id = x.Id,

                        Name = x.Name,

                        Description =
                            x.Description,

                        ImageUrl = x.ImageUrl,

                        Price = x.Price,

                        Stock = x.Stock,

                        IsActive =
                            x.IsActive,

                        CategoryId =
                            x.CategoryId,

                        CategoryName =
                            x.Category.Name
                    })
                .ToListAsync();
        }


        // =========================================================
        // GET SELLER PRODUCT BY ID
        // =========================================================

        public async Task<SellerProductResponseDto?>
            GetMyProductByIdAsync(
                int productId,
                int sellerId)
        {
            return await _context.Products
                .AsNoTracking()
                .Where(x =>
                    x.Id == productId &&
                    x.SellerId == sellerId)
                .Select(x =>
                    new SellerProductResponseDto
                    {
                        Id = x.Id,

                        Name = x.Name,

                        Description =
                            x.Description,

                        ImageUrl = x.ImageUrl,

                        Price = x.Price,

                        Stock = x.Stock,

                        IsActive =
                            x.IsActive,

                        CategoryId =
                            x.CategoryId,

                        CategoryName =
                            x.Category.Name
                    })
                .FirstOrDefaultAsync();
        }


        // =========================================================
        // UPDATE PRODUCT
        // =========================================================

        public async Task<SellerProductResponseDto>
            UpdateProductAsync(
                int productId,
                UpdateSellerProductDto dto,
                int sellerId)
        {
            var product =
                await _context.Products
                    .FirstOrDefaultAsync(x =>
                        x.Id == productId &&
                        x.SellerId == sellerId);

            if (product == null)
            {
                throw new Exception(
                    "Product not found.");
            }

            var categoryExists =
                await _context.Categories
                    .AnyAsync(x =>
                        x.Id == dto.CategoryId);

            if (!categoryExists)
            {
                throw new Exception(
                    "Category does not exist.");
            }

            product.Name =
                dto.Name.Trim();

            product.Description =
                dto.Description?.Trim();

            if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                product.ImageUrl = dto.ImageUrl.Trim();
            }

            product.Price =
                dto.Price;

            product.CategoryId =
                dto.CategoryId;

            await _context.SaveChangesAsync();

            return await GetMyProductByIdAsync(
                productId,
                sellerId)
                ?? throw new Exception(
                    "Product could not be updated.");
        }


        // =========================================================
        // DELETE PRODUCT
        // =========================================================

        public async Task DeleteProductAsync(
            int productId,
            int sellerId)
        {
            var product =
                await _context.Products
                    .FirstOrDefaultAsync(x =>
                        x.Id == productId &&
                        x.SellerId == sellerId);

            if (product == null)
            {
                throw new Exception(
                    "Product not found.");
            }

            var hasOrderItems = await _context.OrderItems
                .AnyAsync(x => x.ProductId == productId);

            if (!hasOrderItems)
            {
                var cartItems = await _context.CartItems.Where(x => x.ProductId == productId).ToListAsync();
                if (cartItems.Any()) _context.CartItems.RemoveRange(cartItems);

                var deals = await _context.Deals.Where(x => x.ProductId == productId).ToListAsync();
                if (deals.Any()) _context.Deals.RemoveRange(deals);

                var movements = await _context.StockMovements.Where(x => x.ProductId == productId).ToListAsync();
                if (movements.Any()) _context.StockMovements.RemoveRange(movements);

                var feedbacks = await _context.Feedbacks.Where(x => x.ProductId == productId).ToListAsync();
                if (feedbacks.Any()) _context.Feedbacks.RemoveRange(feedbacks);

                var conversations = await _context.Conversations.Where(x => x.ProductId == productId).ToListAsync();
                if (conversations.Any()) _context.Conversations.RemoveRange(conversations);

                _context.Products.Remove(product);
            }
            else
            {
                product.IsActive = false;
            }

            await _context.SaveChangesAsync();
        }


        // =========================================================
        // UPDATE STOCK
        // =========================================================

        public async Task UpdateStockAsync(
            int productId,
            UpdateStockDto dto,
            int sellerId)
        {
            var product =
                await _context.Products
                    .FirstOrDefaultAsync(x =>
                        x.Id == productId &&
                        x.SellerId == sellerId);

            if (product == null)
            {
                throw new Exception(
                    "Product not found.");
            }

            var previousQuantity =
                product.Stock;

            var newQuantity =
                dto.Quantity;

            var quantityChanged =
                newQuantity - previousQuantity;

            product.Stock =
                newQuantity;


            // =====================================================
            // CREATE STOCK MOVEMENT
            // =====================================================

            var movement =
                new StockMovement
                {
                    ProductId =
                        productId,

                    SellerId =
                        sellerId,

                    UserId =
                        sellerId,

                    Quantity =
                        Math.Abs(quantityChanged),

                    Type =
                        quantityChanged >= 0 ? "ADD" : "REMOVE",

                    PreviousQuantity =
                        previousQuantity,

                    NewQuantity =
                        newQuantity,

                    QuantityChanged =
                        quantityChanged,

                    Reason =
                        quantityChanged >= 0
                            ? "Stock increased"
                            : "Stock decreased",

                    CreatedAt =
                        DateTime.UtcNow
                };

            _context.StockMovements.Add(
                movement);

            await _context.SaveChangesAsync();
        }


        // =========================================================
        // GET STOCK HISTORY
        // =========================================================

        public async Task<List<StockMovementResponseDto>>
            GetStockHistoryAsync(
                int productId,
                int sellerId)
        {
            var productExists =
                await _context.Products
                    .AnyAsync(x =>
                        x.Id == productId &&
                        x.SellerId == sellerId);

            if (!productExists)
            {
                throw new Exception(
                    "Product not found or does not belong to you.");
            }

            return await _context.StockMovements
                .AsNoTracking()
                .Where(x =>
                    x.ProductId == productId &&
                    (x.SellerId == sellerId || x.Product.SellerId == sellerId))
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x =>
                    new StockMovementResponseDto
                    {
                        Id = x.Id,

                        ProductId =
                            x.ProductId,

                        ProductName =
                            x.Product.Name,

                        PreviousQuantity =
                            x.PreviousQuantity,

                        NewQuantity =
                            x.NewQuantity,

                        QuantityChanged =
                            x.QuantityChanged,

                        Reason =
                            x.Reason,

                        CreatedAt =
                            x.CreatedAt
                    })
                .ToListAsync();
        }

        public async Task<List<StockMovementResponseDto>>
            GetAllStockHistoryAsync(
                int sellerId)
        {
            return await _context.StockMovements
                .AsNoTracking()
                .Where(x =>
                    x.SellerId == sellerId || x.Product.SellerId == sellerId)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x =>
                    new StockMovementResponseDto
                    {
                        Id = x.Id,

                        ProductId =
                            x.ProductId,

                        ProductName =
                            x.Product.Name,

                        PreviousQuantity =
                            x.PreviousQuantity,

                        NewQuantity =
                            x.NewQuantity,

                        QuantityChanged =
                            x.QuantityChanged,

                        Reason =
                            x.Reason,

                        CreatedAt =
                            x.CreatedAt
                    })
                .ToListAsync();
        }


        // =========================================================
        // CREATE DEAL
        // =========================================================

        public async Task<DealResponseDto>
            CreateDealAsync(
                CreateDealDto dto,
                int sellerId)
        {
            var now = DateTime.UtcNow;

            var product =
                await _context.Products
                    .FirstOrDefaultAsync(x =>
                        x.Id == dto.ProductId &&
                        x.SellerId == sellerId);

            if (product == null)
            {
                throw new Exception(
                    "Product not found or does not belong to you.");
            }

            if (!product.IsActive)
            {
                throw new Exception(
                    "Deals can only be created for active products.");
            }

            if (dto.EndDate <= dto.StartDate)
            {
                throw new Exception(
                    "End date must be after start date.");
            }

            if (dto.StartDate < now)
            {
                throw new Exception(
                    "Start date cannot be in the past.");
            }

            if (dto.DiscountPercentage <= 0 ||
                dto.DiscountPercentage >= 100)
            {
                throw new Exception(
                    "Discount percentage must be greater than 0 and less than 100.");
            }

            var activeDeal =
                await _context.Deals
                    .AnyAsync(x =>
                        x.ProductId == dto.ProductId &&
                        x.SellerId == sellerId &&
                        x.IsActive &&
                        x.EndDate > now);

            if (activeDeal)
            {
                throw new Exception(
                    "This product already has an active deal.");
            }

            var deal =
                new Deal
                {
                    ProductId =
                        dto.ProductId,

                    SellerId =
                        sellerId,

                    DiscountPercentage =
                        dto.DiscountPercentage,

                    StartDate =
                        dto.StartDate,

                    EndDate =
                        dto.EndDate,

                    IsActive =
                        true,

                    CreatedAt =
                        DateTime.UtcNow
                };

            _context.Deals.Add(deal);

            await _context.SaveChangesAsync();

            return new DealResponseDto
            {
                Id = deal.Id,

                ProductId =
                    product.Id,

                ProductName =
                    product.Name,

                OriginalPrice =
                    product.Price,

                DiscountPercentage =
                    deal.DiscountPercentage,

                DealPrice =
                    CalculateDealPrice(
                        product.Price,
                        deal.DiscountPercentage),

                StartDate =
                    deal.StartDate,

                EndDate =
                    deal.EndDate,

                IsActive =
                    deal.IsActive
            };
        }


        // =========================================================
        // CALCULATE DEAL PRICE
        // =========================================================

        private decimal CalculateDealPrice(
            decimal price,
            decimal discountPercentage)
        {
            return price -
                   (price *
                    discountPercentage /
                    100);
        }


        // =========================================================
        // GET SELLER DEALS
        // =========================================================

        public async Task<List<DealResponseDto>>
            GetMyDealsAsync(
                int sellerId)
        {
            // Return ALL of the seller's deals (including soft-deleted
            // and expired) so the "My Deals" page can show full history
            // with Active / Upcoming / Expired / Deactivated status
            // badges. Status is computed on the frontend.
            return await _context.Deals
                .AsNoTracking()
                .Where(x =>
                    x.SellerId == sellerId)
                .OrderByDescending(x =>
                    x.Id)
                .Select(x =>
                    new DealResponseDto
                    {
                        Id = x.Id,

                        ProductId =
                            x.ProductId,

                        ProductName =
                            x.Product.Name,

                        OriginalPrice =
                            x.Product.Price,

                        DiscountPercentage =
                            x.DiscountPercentage,

                        DealPrice =
                            x.Product.Price -
                            (x.Product.Price *
                             x.DiscountPercentage /
                             100),

                        StartDate =
                            x.StartDate,

                        EndDate =
                            x.EndDate,

                        IsActive =
                            x.IsActive
                    })
                .ToListAsync();
        }


        // =========================================================
        // GET SELLER DEAL BY ID
        // =========================================================

        public async Task<DealResponseDto?>
            GetMyDealByIdAsync(
                int dealId,
                int sellerId)
        {
            return await _context.Deals
                .AsNoTracking()
                .Include(x => x.Product)
                .Where(x =>
                    x.Id == dealId &&
                    x.SellerId == sellerId)
                .Select(x =>
                    new DealResponseDto
                    {
                        Id = x.Id,

                        ProductId = x.ProductId,

                        ProductName = x.Product.Name,

                        OriginalPrice = x.Product.Price,

                        DiscountPercentage =
                            x.DiscountPercentage,

                        DealPrice =
                            x.Product.Price -
                            (x.Product.Price *
                             x.DiscountPercentage /
                             100),

                        StartDate = x.StartDate,

                        EndDate = x.EndDate,

                        IsActive = x.IsActive
                    })
                .FirstOrDefaultAsync();
        }


        // =========================================================
        // UPDATE DEAL
        // =========================================================

        public async Task<DealResponseDto>
            UpdateDealAsync(
                int dealId,
                UpdateDealDto dto,
                int sellerId)
        {
            var deal =
                await _context.Deals
                    .Include(x =>
                        x.Product)
                    .FirstOrDefaultAsync(x =>
                        x.Id == dealId &&
                        x.SellerId == sellerId);

            if (deal == null)
            {
                throw new Exception(
                    "Deal not found.");
            }

            if (dto.EndDate <= dto.StartDate)
            {
                throw new Exception(
                    "End date must be after start date.");
            }

            if (dto.DiscountPercentage <= 0 ||
                dto.DiscountPercentage >= 100)
            {
                throw new Exception(
                    "Discount percentage must be greater than 0 and less than 100.");
            }

            var product =
                await _context.Products
                    .FirstOrDefaultAsync(x =>
                        x.Id == dto.ProductId &&
                        x.SellerId == sellerId);

            if (product == null)
            {
                throw new Exception(
                    "Product not found or does not belong to you.");
            }

            if (dto.IsActive && !product.IsActive)
            {
                throw new Exception(
                    "Active deals can only be assigned to active products.");
            }

            var hasOverlappingDeal = dto.IsActive &&
                await _context.Deals.AnyAsync(x =>
                    x.Id != dealId &&
                    x.ProductId == dto.ProductId &&
                    x.SellerId == sellerId &&
                    x.IsActive &&
                    x.StartDate < dto.EndDate &&
                    x.EndDate > dto.StartDate);

            if (hasOverlappingDeal)
            {
                throw new Exception(
                    "This product already has an overlapping active deal.");
            }

            deal.ProductId = product.Id;
            deal.Product = product;

            deal.DiscountPercentage =
                dto.DiscountPercentage;

            deal.StartDate =
                dto.StartDate;

            deal.EndDate =
                dto.EndDate;

            deal.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return new DealResponseDto
            {
                Id = deal.Id,

                ProductId =
                    deal.ProductId,

                ProductName =
                    deal.Product.Name,

                OriginalPrice =
                    deal.Product.Price,

                DiscountPercentage =
                    deal.DiscountPercentage,

                DealPrice =
                    CalculateDealPrice(
                        deal.Product.Price,
                        deal.DiscountPercentage),

                StartDate =
                    deal.StartDate,

                EndDate =
                    deal.EndDate,

                IsActive =
                    deal.IsActive
            };
        }


        // =========================================================
        // DELETE DEAL
        // =========================================================

        public async Task DeleteDealAsync(
            int dealId,
            int sellerId)
        {
            var deal =
                await _context.Deals
                    .FirstOrDefaultAsync(x =>
                        x.Id == dealId &&
                        x.SellerId == sellerId);

            if (deal == null)
            {
                throw new Exception(
                    "Deal not found.");
            }

            // Soft delete
            deal.IsActive = false;

            await _context.SaveChangesAsync();
        }


        // =========================================================
        // GET SELLER PROFILE
        // =========================================================

        public async Task<SellerProfileResponseDto>
            GetProfileAsync(
                int sellerId)
        {
            var seller =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.Id == sellerId);

            if (seller == null)
            {
                throw new Exception(
                    "Seller not found.");
            }

            return new SellerProfileResponseDto
            {
                Id = seller.Id,

                Name = seller.FullName,

                Email = seller.Email,

                Role = "Seller"
            };
        }


        // =========================================================
        // UPDATE SELLER PROFILE
        // =========================================================

        public async Task<SellerProfileResponseDto>
            UpdateProfileAsync(
                int sellerId,
                UpdateSellerProfileDto dto)
        {
            var seller =
                await _context.Users
                    .FirstOrDefaultAsync(x =>
                        x.Id == sellerId);

            if (seller == null)
            {
                throw new Exception(
                    "Seller not found.");
            }

            var email =
                dto.Email.Trim();

            var emailExists =
                await _context.Users
                    .AnyAsync(x =>
                        x.Email == email &&
                        x.Id != sellerId);

            if (emailExists)
            {
                throw new Exception(
                    "Email is already in use.");
            }

            seller.FullName =
                dto.Name.Trim();

            seller.Email =
                email;

            await _context.SaveChangesAsync();

            return new SellerProfileResponseDto
            {
                Id = seller.Id,

                Name = seller.FullName,

                Email = seller.Email,

                Role = "Seller"
            };
        }

        public async Task<List<SellerOrderResponseDto>>
            GetMyOrdersAsync(
        int sellerId)
        {
            return await _context.OrderItems
                .AsNoTracking()
                .Where(x =>
                    x.Product.SellerId == sellerId)
                .Select(x =>
                    new SellerOrderResponseDto
                    {
                        OrderId =
                            x.OrderId,

                        ProductId =
                            x.ProductId,

                        ProductName =
                            x.Product.Name,

                        Quantity =
                            x.Quantity,

                        UnitPrice =
                            x.UnitPrice,

                        TotalPrice =
                            x.UnitPrice * x.Quantity,

                        OrderDate =
                            x.Order.CreatedAt,

                        Status =
                            x.Order.Status.ToString(),

                        ShippingAddress =
                            x.Order.ShippingAddress,

                        TrackingNumber =
                            x.Order.Shipping!.TrackingNumber,

                        ShippedAt =
                            x.Order.Shipping!.ShippedAt,

                        DeliveredAt =
                            x.Order.Shipping!.DeliveredAt,
                        PaymentMethodType = x.Order.PaymentMethodType ?? "COD",
                        PaymentStatus = x.Order.PaymentStatus.ToString(),
                        PaidAt = x.Order.Payment != null ? x.Order.Payment.PaidAt : (x.Order.PaymentStatus == ECommerce.API.Models.PaymentStatus.Paid ? x.Order.UpdatedAt : null)
                    })
                .OrderByDescending(x =>
                    x.OrderDate)
                .ToListAsync();
        }

        public async Task<SellerOrderResponseDto>
    UpdateShippingAsync(
        int orderId,
        UpdateShippingDto dto,
        int sellerId)
        {
            var allowedStatuses =
                new[]
                {
            "Pending",
            "Processing",
            "Shipped",
            "Delivered",
            "Cancelled"
                };

            if (!allowedStatuses.Contains(
                dto.Status))
            {
                throw new Exception(
                    "Invalid order status.");
            }

            var order =
                await _context.Orders
                    .Include(x => x.Shipping)
                    .Include(x => x.OrderItems)
                    .ThenInclude(x => x.Product)
                    .FirstOrDefaultAsync(x =>
                        x.Id == orderId &&
                        x.OrderItems.Any(item =>
                            item.Product.SellerId ==
                            sellerId));

            if (order == null)
            {
                throw new Exception(
                    "Order not found.");
            }

            if (!Enum.TryParse<OrderStatusEnum>(dto.Status, true, out var statusEnum))
            {
                throw new Exception("Invalid order status.");
            }

            OrderStatus status = statusEnum;
            order.Status = status;

            var shipping = order.Shipping ?? new Shipping
            {
                OrderId = order.Id,
                Address = order.ShippingAddress,
                City = order.City ?? string.Empty
            };

            if (order.Shipping == null)
            {
                _context.Shippings.Add(shipping);
            }

            shipping.ShippingStatus = status.ToString();

            if (!string.IsNullOrWhiteSpace(
                dto.TrackingNumber))
            {
                shipping.TrackingNumber =
                    dto.TrackingNumber.Trim();
            }

            if (dto.Status == "Shipped")
            {
                shipping.TrackingNumber ??=
                    $"SHP-{order.Id}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}";

                shipping.ShippedAt ??=
                    DateTime.UtcNow;
            }

            if (dto.Status == "Delivered")
            {
                if (shipping.ShippedAt == null)
                {
                    throw new Exception(
                        "An order must be shipped before it can be delivered.");
                }

                shipping.DeliveredAt ??=
                    DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            var item =
                order.OrderItems
                    .First(x =>
                        x.Product.SellerId ==
                        sellerId);

            return new SellerOrderResponseDto
            {
                OrderId =
                    order.Id,

                ProductId =
                    item.ProductId,

                ProductName =
                    item.Product.Name,

                Quantity =
                    item.Quantity,

                UnitPrice =
                    item.UnitPrice,

                TotalPrice =
                    item.UnitPrice *
                    item.Quantity,

                OrderDate =
                    order.CreatedAt,

                Status =
                    order.Status.ToString(),

                ShippingAddress =
                    order.ShippingAddress,

                TrackingNumber =
                    shipping.TrackingNumber,

                ShippedAt =
                    shipping.ShippedAt,

                DeliveredAt =
                    shipping.DeliveredAt,
                PaymentMethodType = order.PaymentMethodType ?? "COD",
                PaymentStatus = order.PaymentStatus.ToString(),
                PaidAt = order.Payment != null ? order.Payment.PaidAt : (order.PaymentStatus == ECommerce.API.Models.PaymentStatus.Paid ? order.UpdatedAt : null)
            };
        }

        public async Task<SellerDashboardResponseDto>
    GetDashboardAsync(int sellerId)
        {
            var totalProducts =
                await _context.Products
                    .CountAsync(x => x.SellerId == sellerId);

            var totalOrders =
                await _context.OrderItems
                    .Where(x => x.Product.SellerId == sellerId)
                    .Select(x => x.OrderId)
                    .Distinct()
                    .CountAsync();

            var pendingOrders =
                await _context.OrderItems
                    .Where(x =>
                        x.Product.SellerId == sellerId &&
                        x.Order.Status == "Pending")
                    .Select(x => x.OrderId)
                    .Distinct()
                    .CountAsync();

            var totalSales =
                await _context.OrderItems
                    .Where(x =>
                        x.Product.SellerId == sellerId &&
                        x.Order.Status != "Cancelled")
                    .SumAsync(x => (decimal?)x.TotalPrice) ?? 0;

            var totalStock =
                await _context.Products
                    .Where(x => x.SellerId == sellerId)
                    .SumAsync(x => (int?)x.Stock) ?? 0;

            return new SellerDashboardResponseDto
            {
                TotalProducts = totalProducts,
                TotalOrders = totalOrders,
                PendingOrders = pendingOrders,
                TotalSales = totalSales,
                TotalStock = totalStock
            };
        }

        public async Task ChangePasswordAsync(int sellerId, ChangeSellerPasswordDto dto)
        {
            var seller = await _context.Users
                .FirstOrDefaultAsync(x =>
                    x.Id == sellerId);

            if (seller == null)
            {
                throw new Exception("Seller not found.");
            }

            var currentValid = BCrypt.Net.BCrypt.Verify(
                dto.CurrentPassword,
                seller.PasswordHash);

            if (!currentValid)
            {
                throw new Exception("Current password is incorrect.");
            }

            if (dto.NewPassword == dto.CurrentPassword)
            {
                throw new Exception("New password must be different from the current password.");
            }

            seller.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _context.SaveChangesAsync();
        }
        public async Task<CreateSellerProductResponseDto>
    AddProductAsync(
        int sellerId,
        CreateSellerProductDto dto)
        {
            var sellerExists =
                await _context.Users
                    .AnyAsync(x => x.Id == sellerId);

            if (!sellerExists)
            {
                throw new Exception(
                    "Seller not found.");
            }

            var category =
                await _context.Categories
                    .FirstOrDefaultAsync(
                        x => x.Id == dto.CategoryId);

            if (category == null)
            {
                throw new Exception(
                    "Category not found.");
            }

            var productName = dto.Name.Trim();

            if (string.IsNullOrWhiteSpace(productName))
            {
                throw new Exception(
                    "Product name is required.");
            }

            var productExists =
                await _context.Products
                    .AnyAsync(x =>
                        x.SellerId == sellerId &&
                        x.Name.ToLower() ==
                        productName.ToLower());

            if (productExists)
            {
                throw new Exception(
                    "You already have a product with this name.");
            }

            if (dto.Price <= 0)
            {
                throw new Exception(
                    "Price must be greater than zero.");
            }

            if (dto.Stock < 0)
            {
                throw new Exception(
                    "Stock cannot be negative.");
            }

            if (string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                throw new Exception(
                    "A product image is required.");
            }

            var product = new Product
            {
                Name = productName,
                Description = dto.Description?.Trim() ?? string.Empty,
                ImageUrl = dto.ImageUrl.Trim(),
                Price = dto.Price,
                Stock = dto.Stock,
                SellerId = sellerId,
                CategoryId = dto.CategoryId,
                IsActive = dto.IsActive
            };

            _context.Products.Add(product);

            await _context.SaveChangesAsync();

            if (product.Stock > 0)
            {
                _context.StockMovements.Add(new StockMovement
                {
                    ProductId = product.Id,
                    SellerId = sellerId,
                    UserId = sellerId,
                    Quantity = product.Stock,
                    Type = "ADD",
                    PreviousQuantity = 0,
                    NewQuantity = product.Stock,
                    QuantityChanged = product.Stock,
                    Reason = "Initial stock",
                    CreatedAt = DateTime.UtcNow
                });

                await _context.SaveChangesAsync();
            }

            return new CreateSellerProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Price = product.Price,
                Stock = product.Stock,
                CategoryId = product.CategoryId,
                CategoryName = category.Name,
                IsActive = product.IsActive
            };
        }
        public async Task<List<SellerCategoryResponseDto>>
    GetCategoriesAsync()
        {
            return await _context.Categories
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .Select(x => new SellerCategoryResponseDto
                {
                    Id = x.Id,
                    Name = x.Name
                })
                .ToListAsync();
        }
        public async Task<CreateSellerProductResponseDto>
    UpdateProductAsync(
        int sellerId,
        int productId,
        UpdateSellerProductDto dto)
        {
            var product =
                await _context.Products
                    .FirstOrDefaultAsync(x =>
                        x.Id == productId &&
                        x.SellerId == sellerId);

            if (product == null)
            {
                throw new Exception(
                    "Product not found.");
            }

            var category =
                await _context.Categories
                    .FirstOrDefaultAsync(
                        x => x.Id == dto.CategoryId);

            if (category == null)
            {
                throw new Exception(
                    "Category not found.");
            }

            var productName = dto.Name.Trim();

            if (string.IsNullOrWhiteSpace(productName))
            {
                throw new Exception(
                    "Product name is required.");
            }

            var duplicateProduct =
                await _context.Products
                    .AnyAsync(x =>
                        x.Id != productId &&
                        x.SellerId == sellerId &&
                        x.Name.ToLower() ==
                        productName.ToLower());

            if (duplicateProduct)
            {
                throw new Exception(
                    "You already have another product with this name.");
            }

            if (dto.Price <= 0)
            {
                throw new Exception(
                    "Price must be greater than zero.");
            }

            if (dto.Stock < 0)
            {
                throw new Exception(
                    "Stock cannot be negative.");
            }

            product.Name = productName;
            product.Description =
                dto.Description?.Trim() ?? string.Empty;
            if (!string.IsNullOrWhiteSpace(dto.ImageUrl))
            {
                product.ImageUrl = dto.ImageUrl.Trim();
            }
            product.Price = dto.Price;
            product.Stock = dto.Stock;
            product.CategoryId = dto.CategoryId;
            product.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return new CreateSellerProductResponseDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ImageUrl = product.ImageUrl,
                Price = product.Price,
                Stock = product.Stock,
                CategoryId = product.CategoryId,
                CategoryName = category.Name,
                IsActive = product.IsActive
            };
        }
        public async Task<SellerStockResponseDto>
    UpdateStockAsync(
        int sellerId,
        int productId,
        string action,
        UpdateSellerStockDto dto)
        {
            var product =
                await _context.Products
                    .FirstOrDefaultAsync(x =>
                        x.Id == productId &&
                        x.SellerId == sellerId);

            if (product == null)
            {
                throw new Exception(
                    "Product not found.");
            }

            if (dto.Quantity <= 0)
            {
                throw new Exception(
                    "Quantity must be greater than zero.");
            }

            if (string.IsNullOrWhiteSpace(dto.Reason))
            {
                throw new Exception(
                    "Reason is required.");
            }

            action = action.Trim().ToLower();

            var previousStock = product.Stock;
            var newStock = previousStock;

            if (action == "increase")
            {
                newStock =
                    previousStock + dto.Quantity;
            }
            else if (action == "decrease")
            {
                newStock =
                    previousStock - dto.Quantity;

                if (newStock < 0)
                {
                    throw new Exception(
                        "Stock cannot be negative.");
                }
            }
            else
            {
                throw new Exception(
                    "Invalid stock action. Use increase or decrease.");
            }

            product.Stock = newStock;

            var stockMovement =
                new StockMovement
                {
                    ProductId = product.Id,
                    SellerId = sellerId,
                    UserId = sellerId,
                    Quantity = dto.Quantity,
                    Type = action.ToUpper(),
                    QuantityChanged =
                        action == "increase"
                            ? dto.Quantity
                            : -dto.Quantity,
                    PreviousQuantity = previousStock,
                    NewQuantity = newStock,
                    Reason = dto.Reason.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

            _context.StockMovements.Add(
                stockMovement);

            await _context.SaveChangesAsync();

            return new SellerStockResponseDto
            {
                ProductId = product.Id,
                ProductName = product.Name,
                CurrentStock = previousStock,
                StockChange =
                    action == "increase"
                        ? dto.Quantity
                        : -dto.Quantity,
                NewStock = newStock,
                Action = action,
                Reason = dto.Reason.Trim()
            };
        }


        // =========================================================
        // SELLER SHIPPING — STEP 20.1 + 20.2
        // =========================================================

        // GET ALL SHIPPING RECORDS FOR SELLER
        public async Task<List<SellerShippingDto>>
            GetSellerShippingAsync(
                int sellerId)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.Customer)
                .Include(o => o.Shipping)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(o =>
                    o.OrderItems.Any(oi =>
                        oi.Product.SellerId == sellerId))
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new SellerShippingDto
                {
                    OrderId = o.Id,

                    CustomerName =
                        o.Customer.FullName,

                    ShippingAddress =
                        o.ShippingAddress ?? string.Empty,

                    City =
                        o.City ?? string.Empty,

                    PhoneNumber =
                        o.PhoneNumber ?? string.Empty,

                    TrackingNumber =
                        o.Shipping != null
                            ? o.Shipping.TrackingNumber
                            : null,

                    OrderStatus =
                        o.Status.ToString(),

                    ShippedAt =
                        o.Shipping != null
                            ? o.Shipping.ShippedAt
                            : null,

                    DeliveredAt =
                        o.Shipping != null
                            ? o.Shipping.DeliveredAt
                            : null
                })
                .ToListAsync();
        }


        // GET SINGLE ORDER SHIPPING FOR SELLER
        public async Task<SellerShippingDto?>
            GetSellerShippingByOrderIdAsync(
                int orderId,
                int sellerId)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.Customer)
                .Include(o => o.Shipping)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Where(o =>
                    o.Id == orderId &&
                    o.OrderItems.Any(oi =>
                        oi.Product.SellerId == sellerId))
                .Select(o => new SellerShippingDto
                {
                    OrderId = o.Id,

                    CustomerName =
                        o.Customer.FullName,

                    ShippingAddress =
                        o.ShippingAddress ?? string.Empty,

                    City =
                        o.City ?? string.Empty,

                    PhoneNumber =
                        o.PhoneNumber ?? string.Empty,

                    TrackingNumber =
                        o.Shipping != null
                            ? o.Shipping.TrackingNumber
                            : null,

                    OrderStatus =
                        o.Status.ToString(),

                    ShippedAt =
                        o.Shipping != null
                            ? o.Shipping.ShippedAt
                            : null,

                    DeliveredAt =
                        o.Shipping != null
                            ? o.Shipping.DeliveredAt
                            : null
                })
                .FirstOrDefaultAsync();
        }


        // UPDATE TRACKING NUMBER
        public async Task UpdateTrackingNumberAsync(
            int orderId,
            int sellerId,
            string trackingNumber)
        {
            if (string.IsNullOrWhiteSpace(trackingNumber))
            {
                throw new Exception(
                    "Tracking number is required.");
            }

            var order = await _context.Orders
                .Include(o => o.Shipping)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o =>
                    o.Id == orderId &&
                    o.OrderItems.Any(oi =>
                        oi.Product.SellerId == sellerId));

            if (order == null)
            {
                throw new Exception(
                    "Order not found.");
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                throw new Exception(
                    "Cancelled orders cannot be updated.");
            }

            if (order.Shipping == null)
            {
                order.Shipping = new Shipping
                {
                    OrderId = order.Id,
                    Address =
                        order.ShippingAddress ?? string.Empty,
                    City =
                        order.City ?? string.Empty,
                    ShippingStatus =
                        order.Status.ToString()
                };
            }

            order.Shipping.TrackingNumber =
                trackingNumber.Trim();

            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }


        // SHIP ORDER
        public async Task ShipOrderAsync(
            int orderId,
            int sellerId)
        {
            var order = await _context.Orders
                .Include(o => o.Shipping)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o =>
                    o.Id == orderId &&
                    o.OrderItems.Any(oi =>
                        oi.Product.SellerId == sellerId));

            if (order == null)
            {
                throw new Exception(
                    "Order not found.");
            }

            if (order.Status == OrderStatus.Cancelled)
            {
                throw new Exception(
                    "Cancelled orders cannot be shipped.");
            }

            if (order.Status == OrderStatus.Delivered)
            {
                throw new Exception(
                    "Delivered orders cannot be shipped again.");
            }

            if (order.Status == OrderStatus.Shipped)
            {
                throw new Exception(
                    "Order is already shipped.");
            }

            if (order.Shipping == null ||
                string.IsNullOrWhiteSpace(
                    order.Shipping.TrackingNumber))
            {
                throw new Exception(
                    "Tracking number must be added before shipping.");
            }

            order.Status = OrderStatus.Shipped;
            order.Shipping.ShippingStatus =
                OrderStatus.Shipped.ToString();
            order.Shipping.ShippedAt = DateTime.UtcNow;

            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }


        // DELIVER ORDER
        public async Task DeliverOrderAsync(
            int orderId,
            int sellerId)
        {
            var order = await _context.Orders
                .Include(o => o.Shipping)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o =>
                    o.Id == orderId &&
                    o.OrderItems.Any(oi =>
                        oi.Product.SellerId == sellerId));

            if (order == null)
            {
                throw new Exception(
                    "Order not found.");
            }

            if (order.Status != OrderStatus.Shipped)
            {
                throw new Exception(
                    "Only shipped orders can be marked as delivered.");
            }

            if (order.Shipping == null)
            {
                throw new Exception(
                    "Shipping information not found.");
            }

            order.Status = OrderStatus.Delivered;
            order.Shipping.ShippingStatus =
                OrderStatus.Delivered.ToString();
            order.Shipping.DeliveredAt = DateTime.UtcNow;

            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
