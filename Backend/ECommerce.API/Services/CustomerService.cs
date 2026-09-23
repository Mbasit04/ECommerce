using ECommerce.API.Data;
using ECommerce.API.DTOs.Customer;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ApplicationDbContext _context;

        public CustomerService(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<CustomerProfileResponseDto>
            GetProfileAsync(
                int customerId)
        {
            var customer =
                await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(x =>
                        x.Id == customerId);

            if (customer == null)
            {
                throw new Exception(
                    "Customer not found.");
            }

            return new CustomerProfileResponseDto
            {
                Id = customer.Id,

                Name = customer.FullName,

                Email = customer.Email,

                Phone = customer.Phone,

                Address = customer.Address,

                City = ExtractCity(customer.Address),

                Role = "Customer"
            };
        }

        public async Task<CustomerProfileResponseDto>
            UpdateProfileAsync(
                int customerId,
                UpdateCustomerProfileDto dto)
        {
            var customer =
                await _context.Users
                    .FirstOrDefaultAsync(x =>
                        x.Id == customerId);

            if (customer == null)
            {
                throw new Exception(
                    "Customer not found.");
            }

            var emailExists =
                await _context.Users
                    .AnyAsync(x =>
                        x.Email == dto.Email &&
                        x.Id != customerId);

            if (emailExists)
            {
                throw new Exception(
                    "Email is already in use.");
            }

            customer.FullName =
                dto.Name.Trim();

            customer.Email =
                dto.Email.Trim();

            customer.Phone =
                string.IsNullOrWhiteSpace(dto.Phone)
                    ? null
                    : dto.Phone.Trim();

            customer.Address =
                string.IsNullOrWhiteSpace(dto.Address)
                    ? null
                    : dto.Address.Trim();

            await _context.SaveChangesAsync();

            return new CustomerProfileResponseDto
            {
                Id = customer.Id,

                Name = customer.FullName,

                Email = customer.Email,

                Phone = customer.Phone,

                Address = customer.Address,

                City = dto.City?.Trim(),

                Role = "Customer"
            };
        }

        public async Task ChangePasswordAsync(
            int customerId,
            ChangeCustomerPasswordDto dto)
        {
            var customer =
                await _context.Users
                    .FirstOrDefaultAsync(x =>
                        x.Id == customerId);

            if (customer == null)
            {
                throw new Exception("Customer not found.");
            }

            var currentValid = BCrypt.Net.BCrypt.Verify(
                dto.CurrentPassword,
                customer.PasswordHash);

            if (!currentValid)
            {
                throw new Exception("Current password is incorrect.");
            }

            if (dto.NewPassword == dto.CurrentPassword)
            {
                throw new Exception(
                    "New password must be different from the current one.");
            }

            customer.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            await _context.SaveChangesAsync();
        }

        // The customer profile exposes City as its own field, but
        // the User model only has a single Address column. We treat
        // the last comma-separated token of Address as the city so
        // the existing data round-trips cleanly.
        private static string? ExtractCity(string? address)
        {
            if (string.IsNullOrWhiteSpace(address)) return null;

            var parts = address.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            return parts.Length > 0 ? parts[^1] : null;
        }

        // Returns the unit price the customer should pay for a
        // product right now, applying the best currently-active deal
        // (if any). Used when adding items to the cart so the stored
        // price already reflects any discount.
        private async Task<decimal> ResolveUnitPriceAsync(Product product)
        {
            var now = DateTime.UtcNow;

            var activeDeal = await _context.Deals
                .Where(d =>
                    d.ProductId == product.Id &&
                    d.IsActive &&
                    d.StartDate <= now &&
                    d.EndDate >= now)
                .OrderByDescending(d => d.DiscountPercentage)
                .FirstOrDefaultAsync();

            if (activeDeal == null)
            {
                return product.Price;
            }

            return Math.Round(
                product.Price -
                (product.Price * activeDeal.DiscountPercentage / 100m),
                2);
        }

        public async Task<List<CustomerProductResponseDto>>
            GetProductsAsync()
        {
            var products =
                await _context.Products
                    .AsNoTracking()
                    .Where(x =>
                        x.IsActive &&
                        x.Stock > 0)
                    .Include(x => x.Category)
                    .Include(x => x.Seller)
                    .Include(x => x.Deals)
                    .ToListAsync();

            var now = DateTime.UtcNow;

            return products
                .Select(product =>
                {
                    var activeDeal =
                        product.Deals
                            .FirstOrDefault(x =>
                                x.IsActive &&
                                x.StartDate <= now &&
                                x.EndDate >= now);

                    var finalPrice =
                        product.Price;

                    if (activeDeal != null)
                    {
                        finalPrice =
                            product.Price -
                            (
                                product.Price *
                                activeDeal.DiscountPercentage /
                                100
                            );
                    }

                    return new CustomerProductResponseDto
                    {
                        Id = product.Id,

                        Name = product.Name,

                        Description =
                            product.Description,

                        ImageUrl = product.ImageUrl,

                        Price = product.Price,

                        Stock = product.Stock,

                        CategoryId =
                            product.CategoryId,

                        CategoryName =
                            product.Category.Name,

                        SellerId =
                            product.SellerId,

                        SellerName =
                            product.Seller.FullName,

                        HasActiveDeal =
                            activeDeal != null,

                        DiscountPercentage =
                            activeDeal?.DiscountPercentage,

                        FinalPrice =
                            Math.Round(
                                finalPrice,
                                2)
                    };
                })
                .ToList();
        }

        public async Task<CustomerProductResponseDto?>
            GetProductByIdAsync(
                int productId)
        {
            var product =
                await _context.Products
                    .AsNoTracking()
                    .Include(x => x.Category)
                    .Include(x => x.Seller)
                    .Include(x => x.Deals)
                    .FirstOrDefaultAsync(x =>
                        x.Id == productId &&
                        x.IsActive);

            if (product == null)
            {
                return null;
            }

            var now =
                DateTime.UtcNow;

            var activeDeal =
                product.Deals
                    .FirstOrDefault(x =>
                        x.IsActive &&
                        x.StartDate <= now &&
                        x.EndDate >= now);

            var finalPrice =
                product.Price;

            if (activeDeal != null)
            {
                finalPrice =
                    product.Price -
                    (
                        product.Price *
                        activeDeal.DiscountPercentage /
                        100
                    );
            }

            return new CustomerProductResponseDto
            {
                Id = product.Id,

                Name = product.Name,

                Description =
                    product.Description,

                ImageUrl = product.ImageUrl,

                Price = product.Price,

                Stock = product.Stock,

                CategoryId =
                    product.CategoryId,

                CategoryName =
                    product.Category.Name,

                SellerId =
                    product.SellerId,

                SellerName =
                    product.Seller.FullName,

                HasActiveDeal =
                    activeDeal != null,

                DiscountPercentage =
                    activeDeal?.DiscountPercentage,

                FinalPrice =
                    Math.Round(
                        finalPrice,
                        2)
            };
        }

        private async Task<Cart> GetOrCreateCartAsync(
    int customerId)
        {
            var cart =
                await _context.Carts
                    .FirstOrDefaultAsync(x =>
                        x.CustomerId == customerId);

            if (cart != null)
            {
                return cart;
            }

            cart = new Cart
            {
                CustomerId = customerId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Carts.Add(cart);

            await _context.SaveChangesAsync();

            return cart;
        }

        private (decimal OriginalPrice, decimal DiscountPercentage, decimal FinalPrice)
            CalculateProductPrice(Product product)
        {
            decimal originalPrice = product.Price;
            decimal discountPercentage = 0;
            var now = DateTime.UtcNow;

            var activeDeal = product.Deals?
                .FirstOrDefault(x =>
                    x.IsActive &&
                    x.StartDate <= now &&
                    x.EndDate >= now);

            if (activeDeal != null)
            {
                discountPercentage = activeDeal.DiscountPercentage;
            }

            decimal finalPrice = Math.Round(
                originalPrice - (originalPrice * discountPercentage / 100m),
                2);

            return (originalPrice, discountPercentage, finalPrice);
        }

        public async Task<CartResponseDto> GetCartAsync(int customerId)
        {
            var cart = await _context.Carts
                .Include(x => x.CartItems)
                    .ThenInclude(x => x.Product)
                        .ThenInclude(x => x.Deals)
                .FirstOrDefaultAsync(x => x.CustomerId == customerId);

            if (cart == null)
            {
                return new CartResponseDto
                {
                    IsValid = true
                };
            }

            var response = new CartResponseDto
            {
                CartId = cart.Id,
                IsValid = true
            };

            foreach (var item in cart.CartItems)
            {
                var product = item.Product;

                if (product == null)
                {
                    response.IsValid = false;
                    response.ValidationMessages.Add(
                        $"Cart item {item.Id}: Product is no longer available."
                    );
                    continue;
                }

                var priceInfo = CalculateProductPrice(product);
                decimal originalPrice = priceInfo.OriginalPrice;
                decimal discountPercentage = priceInfo.DiscountPercentage;
                decimal finalPrice = priceInfo.FinalPrice;

                bool stockValid = true;
                string stockMessage = "Available";

                if (!product.IsActive)
                {
                    stockValid = false;
                    stockMessage = "This product is no longer available.";
                }
                else if (product.Stock <= 0)
                {
                    stockValid = false;
                    stockMessage = "This product is out of stock.";
                }
                else if (item.Quantity > product.Stock)
                {
                    stockValid = false;
                    stockMessage = $"Only {product.Stock} item(s) available.";
                }

                if (!stockValid)
                {
                    response.IsValid = false;
                    response.ValidationMessages.Add(
                        $"{product.Name}: {stockMessage}"
                    );
                }

                var itemTotal = stockValid ? finalPrice * item.Quantity : 0;

                response.Items.Add(
                    new CartItemResponseDto
                    {
                        Id = item.Id,
                        ProductId = product.Id,
                        ProductName = product.Name,
                        ImageUrl = product.ImageUrl,
                        OriginalPrice = originalPrice,
                        UnitPrice = finalPrice,
                        DiscountPercentage = discountPercentage,
                        Quantity = item.Quantity,
                        Stock = product.Stock,
                        TotalPrice = itemTotal,
                        IsStockValid = stockValid,
                        StockMessage = stockMessage
                    }
                );
            }

            response.TotalItems = response.Items.Sum(x => x.Quantity);
            response.TotalAmount = response.Items
                .Where(x => x.IsStockValid)
                .Sum(x => x.TotalPrice);

            return response;
        }

        public async Task<CartResponseDto> AddToCartAsync(
            int customerId,
            AddToCartDto dto)
        {
            if (dto.Quantity <= 0)
                throw new Exception("Quantity must be greater than zero.");

            var product = await _context.Products
                .FirstOrDefaultAsync(x =>
                    x.Id == dto.ProductId &&
                    x.IsActive);

            if (product == null)
                throw new Exception("Product not found.");

            if (product.Stock <= 0)
                throw new Exception("Product is out of stock.");

            if (dto.Quantity > product.Stock)
                throw new Exception("Requested quantity exceeds available stock.");

            var cart = await _context.Carts
                .FirstOrDefaultAsync(x => x.CustomerId == customerId);

            if (cart == null)
            {
                cart = new Cart
                {
                    CustomerId = customerId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(x =>
                    x.CartId == cart.Id &&
                    x.ProductId == dto.ProductId);

            if (existingItem != null)
            {
                var newQuantity = existingItem.Quantity + dto.Quantity;

                if (newQuantity > product.Stock)
                {
                    throw new Exception("Requested quantity exceeds available stock.");
                }

                existingItem.Quantity = newQuantity;
            }
            else
            {
                var price = await ResolveUnitPriceAsync(product);
                cart.CartItems.Add(
                    new CartItem
                    {
                        ProductId = dto.ProductId,
                        Quantity = dto.Quantity,
                        Price = price
                    }
                );
            }

            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetCartAsync(customerId);
        }

        public async Task<CartResponseDto> UpdateCartItemAsync(
            int customerId,
            int cartItemId,
            UpdateCartItemDto dto)
        {
            if (dto.Quantity <= 0)
                throw new Exception("Quantity must be greater than zero.");

            var cartItem = await _context.CartItems
                .Include(x => x.Cart)
                .Include(x => x.Product)
                .FirstOrDefaultAsync(x =>
                    x.Id == cartItemId &&
                    x.Cart.CustomerId == customerId);

            if (cartItem == null)
                throw new Exception("Cart item not found.");

            if (!cartItem.Product.IsActive)
                throw new Exception("This product is no longer available.");

            if (cartItem.Product.Stock <= 0)
                throw new Exception("This product is out of stock.");

            if (dto.Quantity > cartItem.Product.Stock)
                throw new Exception("Requested quantity exceeds available stock.");

            cartItem.Quantity = dto.Quantity;
            cartItem.Cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCartAsync(customerId);
        }

        public async Task<CartResponseDto> RemoveFromCartAsync(
            int customerId,
            int cartItemId)
        {
            var cartItem = await _context.CartItems
                .Include(x => x.Cart)
                .FirstOrDefaultAsync(x =>
                    x.Id == cartItemId &&
                    x.Cart.CustomerId == customerId);

            if (cartItem == null)
                throw new Exception("Cart item not found.");

            _context.CartItems.Remove(cartItem);
            cartItem.Cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCartAsync(customerId);
        }

        public async Task<CartResponseDto> ClearCartAsync(
            int customerId)
        {
            var cart = await _context.Carts
                .Include(x => x.CartItems)
                .FirstOrDefaultAsync(x => x.CustomerId == customerId);

            if (cart == null)
            {
                return new CartResponseDto
                {
                    IsValid = true
                };
            }

            _context.CartItems.RemoveRange(cart.CartItems);
            cart.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetCartAsync(customerId);
        }

        public async Task<OrderResponseDto> CheckoutAsync(
            int customerId,
            CheckoutDto dto)
        {
            var paymentMethod = dto.PaymentMethod?.Trim().ToUpper();

            if (string.IsNullOrWhiteSpace(paymentMethod) ||
                (paymentMethod != "COD" && paymentMethod != "STRIPE"))
            {
                throw new Exception("Invalid payment method.");
            }

            if (string.IsNullOrWhiteSpace(dto.ShippingAddress))
            {
                throw new Exception("Shipping address is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.ContactNumber))
            {
                throw new Exception("Contact number is required.");
            }

            // Resolve the FK PaymentMethodId (1 = COD, 2 = Stripe)
            var paymentMethodName = paymentMethod == "COD" ? "COD" : "Stripe";
            var paymentMethodEntity = await _context.PaymentMethods
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Name == paymentMethodName);

            if (paymentMethodEntity == null)
            {
                throw new Exception("Payment method is not configured.");
            }

            var cart = await _context.Carts
                .Include(x => x.CartItems)
                    .ThenInclude(x => x.Product)
                        .ThenInclude(x => x.Deals)
                .FirstOrDefaultAsync(x => x.CustomerId == customerId);

            if (cart == null || !cart.CartItems.Any())
            {
                throw new Exception("Your cart is empty.");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Fresh stock validation inside transaction
                foreach (var cartItem in cart.CartItems)
                {
                    var product = cartItem.Product;

                    if (product == null)
                    {
                        throw new Exception("A product in your cart is no longer available.");
                    }

                    if (!product.IsActive)
                    {
                        throw new Exception($"{product.Name} is no longer available.");
                    }

                    if (cartItem.Quantity <= 0)
                    {
                        throw new Exception(
                            $"Quantity for {product.Name} must be greater than zero.");
                    }

                    if (product.Stock <= 0)
                    {
                        throw new Exception($"{product.Name} is out of stock.");
                    }

                    if (cartItem.Quantity > product.Stock)
                    {
                        throw new Exception($"{product.Name}: only {product.Stock} item(s) available.");
                    }
                }

                // Create Order
                var order = new Order
                {
                    CustomerId = customerId,
                    CreatedAt = DateTime.UtcNow,
                    TotalAmount = 0,
                    Status = OrderStatus.Pending,
                    PaymentMethodId = paymentMethodEntity.Id,
                    PaymentMethodType = paymentMethodName,
                    ShippingAddress = dto.ShippingAddress.Trim(),
                    PhoneNumber = dto.ContactNumber.Trim()
                };

                _context.Orders.Add(order);

                decimal orderTotal = 0;

                // Create OrderItems & Reduce Stock
                foreach (var cartItem in cart.CartItems)
                {
                    var product = cartItem.Product;

                    var priceInfo = CalculateProductPrice(product);

                    decimal unitPrice = priceInfo.FinalPrice;
                    decimal itemTotal = unitPrice * cartItem.Quantity;

                    var orderItem = new OrderItem
                    {
                        Order = order,
                        ProductId = product.Id,
                        Quantity = cartItem.Quantity,
                        UnitPrice = Math.Round(unitPrice, 2),
                        TotalPrice = Math.Round(itemTotal, 2)
                    };

                    order.OrderItems.Add(orderItem);

                    orderTotal += itemTotal;

                    // Reduce Stock
                    product.Stock -= cartItem.Quantity;
                }

                order.TotalAmount = Math.Round(orderTotal, 2);

                // Clear Cart Items
                _context.CartItems.RemoveRange(cart.CartItems);
                cart.UpdatedAt = DateTime.UtcNow;

                // Save Changes & Commit Transaction
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return new OrderResponseDto
                {
                    OrderId = order.Id,
                    OrderDate = order.OrderDate,
                    TotalAmount = order.TotalAmount,
                    Status = order.Status.ToString(),
                    ShippingAddress = order.ShippingAddress ?? string.Empty,
                    PaymentMethod = order.PaymentMethodType ?? string.Empty,
                    TrackingNumber = order.TrackingNumber,
                    Items = order.OrderItems
                        .Select(x => new OrderItemResponseDto
                        {
                            ProductId = x.ProductId,
                            ProductName = x.Product?.Name ?? string.Empty,
                            Quantity = x.Quantity,
                            UnitPrice = x.UnitPrice,
                            TotalPrice = x.TotalPrice
                        })
                        .ToList()
                };
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<OrderListResponseDto>>
    GetMyOrdersAsync(
        int customerId)
        {
            var orders = await _context.Orders
                .AsNoTracking()
                .Where(x =>
                    x.CustomerId == customerId)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x =>
                    new
                    {
                        OrderId =
                            x.Id,

                        OrderDate =
                            x.CreatedAt,

                        TotalAmount =
                            x.TotalAmount,

                        Status =
                            x.Status,

                        PaymentMethod =
                            x.PaymentMethodType,

                        TotalItems =
                            x.OrderItems
                                .Sum(i => i.Quantity)
                    })
                .ToListAsync();

            return orders
                .Select(x =>
                    new OrderListResponseDto
                    {
                        OrderId = x.OrderId,
                        OrderDate = x.OrderDate,
                        TotalAmount = x.TotalAmount,
                        Status = x.Status.ToString(),
                        PaymentMethod = x.PaymentMethod,
                        TotalItems = x.TotalItems
                    })
                .ToList();
        }

        public async Task<OrderDetailsResponseDto>
        GetOrderDetailsAsync(
        int customerId,
        int orderId)
        {
            var order =
                await _context.Orders
                    .AsNoTracking()
                    .Include(x => x.OrderItems)
                    .ThenInclude(x => x.Product)
                    .FirstOrDefaultAsync(x =>
                        x.Id == orderId &&
                        x.CustomerId == customerId);

            if (order == null)
            {
                throw new Exception(
                    "Order not found.");
            }

            return new OrderDetailsResponseDto
            {
                OrderId =
                    order.Id,

                OrderDate =
                    order.OrderDate,

                TotalAmount =
                    order.TotalAmount,

                Status =
                    order.Status,

                PaymentMethod =
                    order.PaymentMethod,

                ShippingAddress =
                    order.ShippingAddress
                    ?? string.Empty,

                TrackingNumber =
                    order.TrackingNumber,

                ShippedAt =
                    order.ShippedAt,

                DeliveredAt =
                    order.DeliveredAt,

                Items =
                    order.OrderItems
                        .Select(x =>
                            new OrderItemResponseDto
                            {
                                ProductId =
                                    x.ProductId,

                                ProductName =
                                    x.Product.Name,

                                Quantity =
                                    x.Quantity,

                                UnitPrice =
                                    x.UnitPrice,

                                TotalPrice =
                                    x.TotalPrice
                            })
                        .ToList()
            };
        }

        public async Task<bool> CancelOrderAsync(
    int customerId,
    int orderId,
    CancelOrderDto dto)
        {
            var order =
                await _context.Orders
                    .Include(x => x.OrderItems)
                    .ThenInclude(x => x.Product)
                    .FirstOrDefaultAsync(x =>
                        x.Id == orderId &&
                        x.CustomerId == customerId);

            if (order == null)
            {
                throw new Exception(
                    "Order not found.");
            }

            if (order.Status == "Cancelled")
            {
                throw new Exception(
                    "Order is already cancelled.");
            }

            if (order.Status != "Pending" &&
                order.Status != "Processing")
            {
                throw new Exception(
                    "This order can no longer be cancelled.");
            }

            foreach (var item in order.OrderItems)
            {
                item.Product.Stock +=
                    item.Quantity;
            }

            order.Status =
                "Cancelled";

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<RefundResponseDto>
    RequestRefundAsync(
        int customerId,
        int orderId,
        RefundRequestDto dto)
        {
            var order =
                await _context.Orders
                    .FirstOrDefaultAsync(x =>
                        x.Id == orderId &&
                        x.CustomerId == customerId);

            if (order == null)
            {
                throw new Exception(
                    "Order not found.");
            }

            if (order.Status == "Cancelled")
            {
                throw new Exception(
                    "Cancelled orders cannot be refunded.");
            }

            if (order.Status != "Delivered")
            {
                throw new Exception(
                    "Refund can only be requested for delivered orders.");
            }

            var existingRefund =
                await _context.Refunds
                    .FirstOrDefaultAsync(x =>
                        x.OrderId == orderId &&
                        x.Status != "Rejected");

            if (existingRefund != null)
            {
                throw new Exception(
                    "A refund request already exists for this order.");
            }

            if (string.IsNullOrWhiteSpace(dto.Reason))
            {
                throw new Exception(
                    "Refund reason is required.");
            }

            var refund =
                new Refund
                {
                    OrderId =
                        order.Id,

                    CustomerId =
                        customerId,

                    Amount =
                        order.TotalAmount,

                    Reason =
                        dto.Reason.Trim(),

                    Status =
                        "Requested",

                    PaymentMethod =
                        order.PaymentMethod,

                    RequestedAt =
                        DateTime.UtcNow
                };

            _context.Refunds.Add(refund);

            await _context.SaveChangesAsync();

            return new RefundResponseDto
            {
                RefundId =
                    refund.Id,

                OrderId =
                    refund.OrderId,

                Amount =
                    refund.Amount,

                Reason =
                    refund.Reason,

                Status =
                    refund.Status,

                PaymentMethod =
                    refund.PaymentMethod,

                RequestedAt =
                    refund.RequestedAt
            };
        }

        public async Task<FeedbackResponseDto>
    AddFeedbackAsync(
        int customerId,
        int orderId,
        int productId,
        CreateFeedbackDto dto)
        {
            if (dto.Rating < 1 ||
                dto.Rating > 5)
            {
                throw new Exception(
                    "Rating must be between 1 and 5.");
            }

            if (string.IsNullOrWhiteSpace(
                dto.Comment))
            {
                throw new Exception(
                    "Comment is required.");
            }

            var order =
                await _context.Orders
                    .Include(x => x.OrderItems)
                    .FirstOrDefaultAsync(x =>
                        x.Id == orderId &&
                        x.CustomerId == customerId);

            if (order == null)
            {
                throw new Exception(
                    "Order not found.");
            }

            if (order.Status != "Delivered")
            {
                throw new Exception(
                    "You can review products only after the order is delivered.");
            }

            var purchasedProduct =
                order.OrderItems
                    .Any(x =>
                        x.ProductId == productId);

            if (!purchasedProduct)
            {
                throw new Exception(
                    "You did not purchase this product in this order.");
            }

            var product =
                await _context.Products
                    .FirstOrDefaultAsync(x =>
                        x.Id == productId);

            if (product == null)
            {
                throw new Exception(
                    "Product not found.");
            }

            var existingFeedback =
                await _context.Feedbacks
                    .FirstOrDefaultAsync(x =>
                        x.CustomerId == customerId &&
                        x.OrderId == orderId &&
                        x.ProductId == productId);

            if (existingFeedback != null)
            {
                throw new Exception(
                    "You have already reviewed this product.");
            }

            var feedback =
                new Feedback
                {
                    ProductId =
                        productId,

                    CustomerId =
                        customerId,

                    OrderId =
                        orderId,

                    Rating =
                        dto.Rating,

                    Comment =
                        dto.Comment.Trim(),

                    CreatedAt =
                        DateTime.UtcNow
                };

            _context.Feedbacks.Add(feedback);

            await _context.SaveChangesAsync();

            return new FeedbackResponseDto
            {
                Id =
                    feedback.Id,

                ProductId =
                    product.Id,

                ProductName =
                    product.Name,

                Rating =
                    feedback.Rating,

                Comment =
                    feedback.Comment,

                CreatedAt =
                    feedback.CreatedAt
            };
        }

        public async Task<List<FeedbackResponseDto>>
    GetProductFeedbackAsync(
        int productId)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Where(x =>
                    x.ProductId == productId)
                .OrderByDescending(x =>
                    x.CreatedAt)
                .Select(x =>
                    new FeedbackResponseDto
                    {
                        Id =
                            x.Id,

                        ProductId =
                            x.ProductId,

                        ProductName =
                            x.Product.Name,

                        Rating =
                            x.Rating,

                        Comment =
                            x.Comment,

                        CreatedAt =
                            x.CreatedAt
                    })
                .ToListAsync();
        }

        public async Task<ConversationDetailsResponseDto>
    StartConversationAsync(
        int customerId,
        StartConversationDto dto)
        {
            var sellerExists = await _context.Users
                .AnyAsync(x => x.Id == dto.SellerId);

            if (!sellerExists)
            {
                throw new Exception("Seller not found.");
            }

            if (dto.ProductId.HasValue)
            {
                var productExists = await _context.Products
                    .AnyAsync(x =>
                        x.Id == dto.ProductId.Value &&
                        x.SellerId == dto.SellerId);

                if (!productExists)
                {
                    throw new Exception(
                        "Product not found for this seller.");
                }
            }

            var messageText = dto.Message?.Trim();

            if (string.IsNullOrWhiteSpace(messageText))
            {
                throw new Exception("Message cannot be empty.");
            }

            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(x =>
                    x.CustomerId == customerId &&
                    x.SellerId == dto.SellerId &&
                    x.ProductId == dto.ProductId);

            if (conversation == null)
            {
                conversation = new Conversation
                {
                    CustomerId = customerId,
                    SellerId = dto.SellerId,
                    ProductId = dto.ProductId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Conversations.Add(conversation);

                await _context.SaveChangesAsync();
            }

            var message = new Message
            {
                ConversationId = conversation.Id,
                SenderId = customerId,
                ReceiverId = dto.SellerId,
                MessageText = messageText,
                IsRead = false,
                SentAt = DateTime.UtcNow
            };

            conversation.UpdatedAt = DateTime.UtcNow;

            _context.Messages.Add(message);

            await _context.SaveChangesAsync();

            return await GetConversationMessagesAsync(
                customerId,
                conversation.Id);
        }

        public async Task<MessageResponseDto>
    SendMessageAsync(
        int customerId,
        int conversationId,
        SendMessageDto dto)
        {
            var conversation = await _context.Conversations
                .FirstOrDefaultAsync(x =>
                    x.Id == conversationId &&
                    x.CustomerId == customerId);

            if (conversation == null)
            {
                throw new Exception(
                    "Conversation not found.");
            }

            var messageText = dto.Message?.Trim();

            if (string.IsNullOrWhiteSpace(messageText))
            {
                throw new Exception(
                    "Message cannot be empty.");
            }

            var message = new Message
            {
                ConversationId = conversation.Id,
                SenderId = customerId,
                ReceiverId = conversation.SellerId,
                MessageText = messageText,
                IsRead = false,
                SentAt = DateTime.UtcNow
            };

            conversation.UpdatedAt = DateTime.UtcNow;

            _context.Messages.Add(message);

            await _context.SaveChangesAsync();

            return new MessageResponseDto
            {
                MessageId = message.Id,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Message = message.MessageText,
                IsRead = message.IsRead,
                SentAt = message.SentAt
            };
        }
        public async Task<List<ConversationListResponseDto>>
    GetCustomerConversationsAsync(int customerId)
        {
            var conversations = await _context.Conversations
                .AsNoTracking()
                .Include(x => x.Seller)
                .Include(x => x.Product)
                .Include(x => x.Messages)
                .Where(x => x.CustomerId == customerId)
                .OrderByDescending(x => x.UpdatedAt ?? x.CreatedAt)
                .ToListAsync();

            return conversations.Select(x =>
            {
                var lastMessage = x.Messages
                    .OrderByDescending(m => m.SentAt)
                    .FirstOrDefault();

                return new ConversationListResponseDto
                {
                    ConversationId = x.Id,
                    SellerId = x.SellerId,

                    // Change Name according to your User model
                    SellerName = x.Seller.FullName,

                    ProductId = x.ProductId,
                    ProductName = x.Product?.Name,

                    LastMessage = lastMessage?.MessageText,
                    LastMessageAt = lastMessage?.SentAt
                };
            }).ToList();
        }
        public async Task<ConversationDetailsResponseDto>
    GetConversationMessagesAsync(
        int customerId,
        int conversationId)
        {
            var conversation = await _context.Conversations
                .AsNoTracking()
                .Include(x => x.Seller)
                .Include(x => x.Product)
                .Include(x => x.Messages)
                .FirstOrDefaultAsync(x =>
                    x.Id == conversationId &&
                    x.CustomerId == customerId);

            if (conversation == null)
            {
                throw new Exception(
                    "Conversation not found.");
            }

            return new ConversationDetailsResponseDto
            {
                ConversationId = conversation.Id,

                SellerId = conversation.SellerId,

                // Change according to your User model
                SellerName = conversation.Seller.FullName,

                ProductId = conversation.ProductId,

                ProductName = conversation.Product?.Name,

                Messages = conversation.Messages
                    .OrderBy(x => x.SentAt)
                    .Select(x => new MessageResponseDto
                    {
                        MessageId = x.Id,
                        SenderId = x.SenderId,
                        ReceiverId = x.ReceiverId,
                        Message = x.MessageText,
                        IsRead = x.IsRead,
                        SentAt = x.SentAt
                    })
                    .ToList()
            };
        }


        // =========================================================
        // PHASE 23 — REVIEW MANAGEMENT (Customer facing)
        // =========================================================

        // Same data as GetProductFeedbackAsync but joined with customer
        // info so the ProductDetails page can render reviewer names.
        public async Task<List<CustomerReviewDto>>
            GetProductReviewsAsync(
                int productId)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Where(x => x.ProductId == productId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new CustomerReviewDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product.Name,
                    CustomerId = x.CustomerId,
                    CustomerName = x.Customer.FullName,
                    Rating = x.Rating,
                    Comment = x.Comment,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt
                })
                .ToListAsync();
        }

        // Returns the caller's own review for a product (if any) so the
        // UI can offer Edit/Delete controls on the ProductDetails page.
        public async Task<CustomerReviewDto?>
            GetMyReviewForProductAsync(
                int customerId,
                int productId)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Where(x =>
                    x.CustomerId == customerId &&
                    x.ProductId == productId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new CustomerReviewDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product.Name,
                    CustomerId = x.CustomerId,
                    CustomerName = x.Customer.FullName,
                    Rating = x.Rating,
                    Comment = x.Comment,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<FeedbackResponseDto>
            UpdateFeedbackAsync(
                int customerId,
                int feedbackId,
                UpdateFeedbackDto dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
            {
                throw new Exception(
                    "Rating must be between 1 and 5.");
            }

            if (string.IsNullOrWhiteSpace(dto.Comment))
            {
                throw new Exception("Comment is required.");
            }

            var feedback = await _context.Feedbacks
                .FirstOrDefaultAsync(x => x.Id == feedbackId);

            if (feedback == null)
            {
                throw new Exception("Review not found.");
            }

            // Ownership check — a customer may only edit their own review.
            if (feedback.CustomerId != customerId)
            {
                throw new Exception(
                    "You can only edit your own review.");
            }

            feedback.Rating = dto.Rating;
            feedback.Comment = dto.Comment.Trim();
            feedback.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var product = await _context.Products
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == feedback.ProductId);

            return new FeedbackResponseDto
            {
                Id = feedback.Id,
                ProductId = feedback.ProductId,
                ProductName = product?.Name ?? string.Empty,
                Rating = feedback.Rating,
                Comment = feedback.Comment,
                CreatedAt = feedback.CreatedAt
            };
        }

        public async Task<bool>
            DeleteFeedbackAsync(
                int customerId,
                int feedbackId)
        {
            var feedback = await _context.Feedbacks
                .FirstOrDefaultAsync(x => x.Id == feedbackId);

            if (feedback == null)
            {
                throw new Exception("Review not found.");
            }

            // Ownership check — see UpdateFeedbackAsync for rationale.
            if (feedback.CustomerId != customerId)
            {
                throw new Exception(
                    "You can only delete your own review.");
            }

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return true;
        }

        // Aggregate rating rollup for a single product (average + per-star counts).
        public async Task<RatingSummaryDto>
            GetProductRatingSummaryAsync(
                int productId)
        {
            var reviews = await _context.Feedbacks
                .AsNoTracking()
                .Where(x => x.ProductId == productId)
                .Select(x => x.Rating)
                .ToListAsync();

            var summary = new RatingSummaryDto
            {
                ProductId = productId,
                AverageRating = reviews.Count == 0
                    ? 0
                    : Math.Round(reviews.Average(), 2),
                ReviewCount = reviews.Count,
                FiveStar = reviews.Count(r => r == 5),
                FourStar = reviews.Count(r => r == 4),
                ThreeStar = reviews.Count(r => r == 3),
                TwoStar = reviews.Count(r => r == 2),
                OneStar = reviews.Count(r => r == 1)
            };

            return summary;
        }


        // =========================================================
        // PHASE 24 — READ / UNREAD MESSAGE SYSTEM (customer-side)
        // =========================================================

        public async Task MarkMessageReadAsync(
                int customerId,
                int messageId)
        {
            var message = await _context.Messages
                .Include(m => m.Conversation)
                .FirstOrDefaultAsync(m =>
                    m.Id == messageId &&
                    m.Conversation.CustomerId == customerId);

            if (message == null)
            {
                throw new Exception("Message not found.");
            }

            // Only the receiver may mark a message as read — keeps customer
            // A from snooping on customer B's conversations.
            if (message.ReceiverId != customerId)
            {
                throw new Exception(
                    "You can only mark your own received messages as read.");
            }

            if (!message.IsRead)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<int>
            GetUnreadMessageCountAsync(
                int customerId)
        {
            return await _context.Messages
                .Where(m =>
                    m.ReceiverId == customerId &&
                    !m.IsRead)
                .CountAsync();
        }
    }
}
