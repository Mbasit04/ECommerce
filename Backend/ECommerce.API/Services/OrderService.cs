using System.Collections.Generic;
using ECommerce.API.Data;
using ECommerce.API.DTOs.Order;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<OrderResponseDto> CreateAsync(
            CreateOrderDto dto,
            int customerId)
        {
            if (dto.Items == null || dto.Items.Count == 0)
            {
                throw new Exception(
                    "Order must contain at least one product.");
            }

            var productIds = dto.Items
                .Select(x => x.ProductId)
                .Distinct()
                .ToList();

            var products = await _context.Products
                .Where(x =>
                    productIds.Contains(x.Id) &&
                    x.IsActive)
                .Include(x => x.Deals)
                .ToListAsync();

            if (products.Count != productIds.Count)
            {
                throw new Exception(
                    "One or more products do not exist.");
            }

            var paymentMethodExists = await _context.PaymentMethods
                .AsNoTracking()
                .AnyAsync(x => x.Id == dto.PaymentMethodId);

            if (!paymentMethodExists)
            {
                throw new Exception("Invalid payment method.");
            }

            decimal subTotal = 0;
            decimal discountTotal = 0;

            var order = new Order
            {
                CustomerId = customerId,
                PaymentMethodId = dto.PaymentMethodId,
                ShippingAddress = dto.ShippingAddress.Trim(),
                City = dto.City?.Trim(),
                PhoneNumber = dto.PhoneNumber?.Trim(),
                Status = OrderStatus.Pending,
                PaymentStatus = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            foreach (var itemDto in dto.Items)
            {
                var product = products.First(
                    x => x.Id == itemDto.ProductId);

                if (product.Stock < itemDto.Quantity)
                {
                    throw new Exception(
                        $"Insufficient stock for {product.Name}.");
                }

                var unitPrice = product.Price;

                var now = DateTime.UtcNow;

                var activeDeal = product.Deals
                    .Where(x =>
                        x.IsActive &&
                        x.StartDate <= now &&
                        x.EndDate >= now)
                    .OrderByDescending(
                        x => x.DiscountPercentage)
                    .FirstOrDefault();

                decimal discountAmount = 0;

                if (activeDeal != null)
                {
                    discountAmount =
                        unitPrice *
                        activeDeal.DiscountPercentage /
                        100;
                }

                var finalUnitPrice =
                    unitPrice - discountAmount;

                var totalPrice =
                    finalUnitPrice * itemDto.Quantity;

                var originalTotal =
                    unitPrice * itemDto.Quantity;

                subTotal += originalTotal;

                discountTotal +=
                    discountAmount * itemDto.Quantity;

                order.OrderItems.Add(
                    new OrderItem
                    {
                        ProductId = product.Id,
                        Quantity = itemDto.Quantity,
                        UnitPrice = unitPrice,
                        DiscountAmount =
                            discountAmount *
                            itemDto.Quantity,
                        TotalPrice = totalPrice
                    });

                product.Stock -= itemDto.Quantity;
            }

            order.SubTotal = subTotal;

            order.DiscountAmount = discountTotal;

            order.ShippingAmount = 0;

            order.TotalAmount =
                subTotal -
                discountTotal +
                order.ShippingAmount;

            _context.Orders.Add(order);

            await _context.SaveChangesAsync();

            return await GetByIdInternalAsync(order.Id)
                   ?? throw new Exception(
                       "Unable to create order.");
        }

        public async Task<OrderResponseDto?> GetByIdAsync(
            int orderId,
            int customerId)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(x => x.Customer)
                .Include(x => x.PaymentMethod)
                .Include(x => x.OrderItems)
                .ThenInclude(x => x.Product)
                .Where(x =>
                    x.Id == orderId &&
                    x.CustomerId == customerId)
                .Select(x => new OrderResponseDto
                {
                    Id = x.Id,

                    CustomerId = x.CustomerId,

                    CustomerName = x.Customer != null ? (x.Customer.FullName ?? x.Customer.Email) : null,

                    CustomerEmail = x.Customer != null ? x.Customer.Email : null,

                    SubTotal = x.SubTotal,

                    DiscountAmount = x.DiscountAmount,

                    ShippingAmount = x.ShippingAmount,

                    TotalAmount = x.TotalAmount,

                    Status = x.Status,

                    PaymentStatus = x.PaymentStatus,

                    PaymentMethod = x.PaymentMethod != null ? x.PaymentMethod.Name : (x.PaymentMethodType ?? "COD"),

                    ShippingAddress =
                        x.ShippingAddress,

                    City = x.City,

                    PhoneNumber = x.PhoneNumber,

                    CreatedAt = x.CreatedAt,

                    Items = x.OrderItems
                        .Select(i =>
                            new OrderItemResponseDto
                            {
                                ProductId =
                                    i.ProductId,

                                // Project Product fields directly.
                                // i.Product is null after materialization
                                // even though the Include/ThenInclude
                                // generated the SQL JOIN, same NRE trap
                                // as GetCartAsync.
                                ProductName =
                                    i.Product != null
                                        ? i.Product.Name
                                        : null,

                                Quantity =
                                    i.Quantity,

                                UnitPrice =
                                    i.UnitPrice,

                                DiscountAmount =
                                    i.DiscountAmount,

                                TotalPrice =
                                    i.TotalPrice
                            })
                        .ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<OrderResponseDto>>
            GetMyOrdersAsync(int customerId)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(x => x.Customer)
                .Include(x => x.PaymentMethod)
                .Include(x => x.OrderItems)
                .ThenInclude(x => x.Product)
                .Where(x => x.CustomerId == customerId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new OrderResponseDto
                {
                    Id = x.Id,

                    CustomerId = x.CustomerId,

                    CustomerName = x.Customer != null ? (x.Customer.FullName ?? x.Customer.Email) : null,

                    CustomerEmail = x.Customer != null ? x.Customer.Email : null,

                    SubTotal = x.SubTotal,

                    DiscountAmount =
                        x.DiscountAmount,

                    ShippingAmount =
                        x.ShippingAmount,

                    TotalAmount =
                        x.TotalAmount,

                    Status = x.Status,

                    PaymentStatus =
                        x.PaymentStatus,

                    PaymentMethod =
                        x.PaymentMethod != null ? x.PaymentMethod.Name : (x.PaymentMethodType ?? "COD"),

                    ShippingAddress =
                        x.ShippingAddress,

                    City = x.City,

                    PhoneNumber =
                        x.PhoneNumber,

                    CreatedAt =
                        x.CreatedAt,

                    Items = x.OrderItems
                        .Select(i =>
                            new OrderItemResponseDto
                            {
                                ProductId =
                                    i.ProductId,

                                // Project Product fields directly.
                                // i.Product is null after materialization
                                // even though the Include/ThenInclude
                                // generated the SQL JOIN, same NRE trap
                                // as GetCartAsync.
                                ProductName =
                                    i.Product != null
                                        ? i.Product.Name
                                        : null,

                                Quantity =
                                    i.Quantity,

                                UnitPrice =
                                    i.UnitPrice,

                                DiscountAmount =
                                    i.DiscountAmount,

                                TotalPrice =
                                    i.TotalPrice
                            })
                        .ToList()
                })
                .ToListAsync();
        }

        public async Task<List<OrderResponseDto>>
            GetAllAsync()
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(x => x.Customer)
                .Include(x => x.PaymentMethod)
                .Include(x => x.OrderItems)
                .ThenInclude(x => x.Product)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new OrderResponseDto
                {
                    Id = x.Id,

                    CustomerId = x.CustomerId,

                    CustomerName = x.Customer != null ? (x.Customer.FullName ?? x.Customer.Email) : null,

                    CustomerEmail = x.Customer != null ? x.Customer.Email : null,

                    SubTotal = x.SubTotal,

                    DiscountAmount =
                        x.DiscountAmount,

                    ShippingAmount =
                        x.ShippingAmount,

                    TotalAmount =
                        x.TotalAmount,

                    Status = x.Status,

                    PaymentStatus =
                        x.PaymentStatus,

                    PaymentMethod =
                        x.PaymentMethod != null ? x.PaymentMethod.Name : (x.PaymentMethodType ?? "COD"),

                    ShippingAddress =
                        x.ShippingAddress,

                    City = x.City,

                    PhoneNumber =
                        x.PhoneNumber,

                    CreatedAt =
                        x.CreatedAt,

                    Items = x.OrderItems
                        .Select(i =>
                            new OrderItemResponseDto
                            {
                                ProductId =
                                    i.ProductId,

                                // Project Product fields directly.
                                // i.Product is null after materialization
                                // even though the Include/ThenInclude
                                // generated the SQL JOIN, same NRE trap
                                // as GetCartAsync.
                                ProductName =
                                    i.Product != null
                                        ? i.Product.Name
                                        : null,

                                Quantity =
                                    i.Quantity,

                                UnitPrice =
                                    i.UnitPrice,

                                DiscountAmount =
                                    i.DiscountAmount,

                                TotalPrice =
                                    i.TotalPrice
                            })
                        .ToList()
                })
                .ToListAsync();
        }

        private async Task<OrderResponseDto?>
            GetByIdInternalAsync(int orderId)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(x => x.Customer)
                .Include(x => x.PaymentMethod)
                .Include(x => x.OrderItems)
                .ThenInclude(x => x.Product)
                .Where(x => x.Id == orderId)
                .Select(x => new OrderResponseDto
                {
                    Id = x.Id,

                    CustomerId = x.CustomerId,

                    CustomerName = x.Customer != null ? (x.Customer.FullName ?? x.Customer.Email) : null,

                    CustomerEmail = x.Customer != null ? x.Customer.Email : null,

                    SubTotal = x.SubTotal,

                    DiscountAmount =
                        x.DiscountAmount,

                    ShippingAmount =
                        x.ShippingAmount,

                    TotalAmount =
                        x.TotalAmount,

                    Status = x.Status,

                    PaymentStatus =
                        x.PaymentStatus,

                    PaymentMethod =
                        x.PaymentMethod != null ? x.PaymentMethod.Name : (x.PaymentMethodType ?? "COD"),

                    ShippingAddress =
                        x.ShippingAddress,

                    City = x.City,

                    PhoneNumber =
                        x.PhoneNumber,

                    CreatedAt =
                        x.CreatedAt,

                    Items = x.OrderItems
                        .Select(i =>
                            new OrderItemResponseDto
                            {
                                ProductId =
                                    i.ProductId,

                                // Project Product fields directly.
                                // i.Product is null after materialization
                                // even though the Include/ThenInclude
                                // generated the SQL JOIN, same NRE trap
                                // as GetCartAsync.
                                ProductName =
                                    i.Product != null
                                        ? i.Product.Name
                                        : null,

                                Quantity =
                                    i.Quantity,

                                UnitPrice =
                                    i.UnitPrice,

                                DiscountAmount =
                                    i.DiscountAmount,

                                TotalPrice =
                                    i.TotalPrice
                            })
                        .ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<OrderResponseDto?> GetByIdForAdminAsync(int orderId)
        {
            return await GetByIdInternalAsync(orderId);
        }

        public async Task<bool> UpdateStatusAsync(int orderId, string status, string? trackingNumber)
        {
            var order = await _context.Orders
                .Include(x => x.Shipping)
                .FirstOrDefaultAsync(x => x.Id == orderId);

            if (order == null)
            {
                return false;
            }

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrWhiteSpace(trackingNumber))
            {
                order.TrackingNumber = trackingNumber;
            }

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
