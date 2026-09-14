using ECommerce.API.Data;
using ECommerce.API.DTOs.Customer;
using ECommerce.API.DTOs.Payment;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using ECommerce.API.Configuration;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;

namespace ECommerce.API.Services
{
    public class StripePaymentService
        : IPaymentService
    {
        private readonly ApplicationDbContext _context;
        private readonly PaymentService _paymentService;

        private readonly StripeSettings _stripeSettings;

        public StripePaymentService(
            ApplicationDbContext context,
            PaymentService paymentService,
            IOptions<StripeSettings> stripeSettings)
        {
            _context = context;
            _paymentService = paymentService;

            _stripeSettings =
                stripeSettings.Value;
        }

        public async Task<PaymentIntentResponseDto>
            CreatePaymentIntentAsync(
                int customerId)
        {
            var cart =
                await _context.Carts
                    .Include(x => x.CartItems)
                    .ThenInclude(x => x.Product)
                    .FirstOrDefaultAsync(x =>
                        x.CustomerId == customerId);

            if (cart == null ||
                !cart.CartItems.Any())
            {
                throw new Exception(
                    "Your cart is empty.");
            }

            decimal totalAmount = 0;

            var now =
                DateTime.UtcNow;

            foreach (var cartItem
                in cart.CartItems)
            {
                var product =
                    cartItem.Product;

                if (!product.IsActive)
                {
                    throw new Exception(
                        $"Product '{product.Name}' is no longer available.");
                }

                if (cartItem.Quantity >
                    product.Stock)
                {
                    throw new Exception(
                        $"Only {product.Stock} units of '{product.Name}' are available.");
                }

                decimal unitPrice =
                    product.Price;

                var activeDeal =
                    await _context.Deals
                        .Where(x =>
                            x.ProductId == product.Id &&
                            x.IsActive &&
                            x.StartDate <= now &&
                            x.EndDate >= now)
                        .OrderByDescending(x =>
                            x.DiscountPercentage)
                        .FirstOrDefaultAsync();

                if (activeDeal != null)
                {
                    unitPrice =
                        product.Price -
                        (
                            product.Price *
                            activeDeal.DiscountPercentage /
                            100
                        );
                }

                totalAmount +=
                    unitPrice *
                    cartItem.Quantity;
            }

            totalAmount =
                Math.Round(
                    totalAmount,
                    2);

            if (totalAmount <= 0)
            {
                throw new Exception(
                    "Invalid payment amount.");
            }

            StripeConfiguration.ApiKey =
                _stripeSettings.SecretKey;

            var options =
                new PaymentIntentCreateOptions
                {
                    Amount =
                        Convert.ToInt64(
                            totalAmount * 100),

                    Currency = "pkr",

                    AutomaticPaymentMethods =
                        new PaymentIntentAutomaticPaymentMethodsOptions
                        {
                            Enabled = true
                        },

                    Metadata =
                        new Dictionary<string, string>
                        {
                            {
                                "customerId",
                                customerId.ToString()
                            }
                        }
                };

            var service =
                new PaymentIntentService();

            var paymentIntent =
                await service.CreateAsync(
                    options);

            return new PaymentIntentResponseDto
            {
                ClientSecret =
                    paymentIntent.ClientSecret,

                PaymentIntentId =
                    paymentIntent.Id,

                Amount =
                    totalAmount,

                Currency =
                    "pkr"
            };
        }

        public Task<TransactionResponseDto> ProcessCODAsync(
            int orderId,
            int customerId) =>
            _paymentService.ProcessCODAsync(orderId, customerId);

        public Task<TransactionResponseDto?> GetTransactionAsync(
            int orderId,
            int customerId) =>
            _paymentService.GetTransactionAsync(orderId, customerId);

        public Task<List<TransactionResponseDto>> GetAllTransactionsAsync() =>
            _paymentService.GetAllTransactionsAsync();

        public Task<object> MarkCodPaymentAsPaidAsync(int orderId) =>
            _paymentService.MarkCodPaymentAsPaidAsync(orderId);

        public async Task<string>
    CreateRefundAsync(
        string paymentIntentId,
        decimal amount)
        {
            StripeConfiguration.ApiKey =
                _stripeSettings.SecretKey;

            var refundOptions =
                new RefundCreateOptions
                {
                    PaymentIntent =
                        paymentIntentId,

                    Amount =
                        Convert.ToInt64(
                            amount * 100)
                };

            var refundService =
                new RefundService();

            var refund =
                await refundService.CreateAsync(
                    refundOptions);

            return refund.Id;
        }

        public async Task<OrderResponseDto>
            ConfirmStripeCheckoutAsync(
                int customerId,
                StripeCheckoutConfirmDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.PaymentIntentId))
            {
                throw new Exception("Payment intent id is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.ShippingAddress))
            {
                throw new Exception("Shipping address is required.");
            }

            if (string.IsNullOrWhiteSpace(dto.ContactNumber))
            {
                throw new Exception("Contact number is required.");
            }

            // 1. Verify the payment with Stripe
            StripeConfiguration.ApiKey =
                _stripeSettings.SecretKey;

            var paymentIntentService =
                new PaymentIntentService();

            PaymentIntent paymentIntent;
            try
            {
                paymentIntent =
                    await paymentIntentService.GetAsync(
                        dto.PaymentIntentId);
            }
            catch (StripeException ex)
            {
                throw new Exception(
                    $"Stripe could not verify the payment: {ex.StripeError?.Message ?? ex.Message}");
            }

            if (paymentIntent == null)
            {
                throw new Exception("Payment intent not found.");
            }

            if (paymentIntent.Status != "succeeded")
            {
                throw new Exception(
                    $"Payment has not been completed. Current status: {paymentIntent.Status}");
            }

            // 2. Idempotency — if an order was already created for this
            //    payment intent, return it instead of creating a duplicate.
            var existingOrder = await _context.Orders
                .Include(x => x.OrderItems)
                    .ThenInclude(x => x.Product)
                .Include(x => x.Shipping)
                .FirstOrDefaultAsync(x =>
                    x.CustomerId == customerId &&
                    x.PaymentMethodType == "Stripe" &&
                    x.PaymentStatus == PaymentStatus.Paid);

            // We cannot easily link a Stripe payment intent back to the
            // order through DB columns, so we de-dupe by matching the
            // amount + the most-recent Pending Stripe order for this
            // customer. If we already marked the customer as paid within
            // the last 10 minutes for this same amount, return that order.
            var recentPaidOrder = await _context.Orders
                .Include(x => x.OrderItems)
                    .ThenInclude(x => x.Product)
                .Include(x => x.Shipping)
                .Where(x =>
                    x.CustomerId == customerId &&
                    x.PaymentMethodType == "Stripe" &&
                    x.PaymentStatus == PaymentStatus.Paid &&
                    x.UpdatedAt != null &&
                    x.UpdatedAt >= DateTime.UtcNow.AddMinutes(-10) &&
                    x.TotalAmount ==
                        Math.Round(
                            paymentIntent.Amount / 100m,
                            2))
                .OrderByDescending(x => x.UpdatedAt)
                .FirstOrDefaultAsync();

            if (recentPaidOrder != null)
            {
                return MapToResponse(recentPaidOrder);
            }

            // 3. Build the order from the current cart snapshot
            var cart = await _context.Carts
                .Include(x => x.CartItems)
                    .ThenInclude(x => x.Product)
                .FirstOrDefaultAsync(x =>
                    x.CustomerId == customerId);

            if (cart == null || !cart.CartItems.Any())
            {
                throw new Exception("Your cart is empty.");
            }

            var stripePaymentMethod = await _context.PaymentMethods
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Name == "Stripe");

            if (stripePaymentMethod == null)
            {
                throw new Exception("Stripe payment method is not configured.");
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // Re-validate stock atomically
                foreach (var cartItem in cart.CartItems)
                {
                    var product = cartItem.Product;

                    if (product == null || !product.IsActive)
                    {
                        throw new Exception(
                            "A product in your cart is no longer available.");
                    }

                    if (product.Stock < cartItem.Quantity)
                    {
                        throw new Exception(
                            $"{product.Name}: only {product.Stock} item(s) available.");
                    }
                }

                var order = new Order
                {
                    CustomerId = customerId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Status = OrderStatus.Confirmed,
                    PaymentMethodId = stripePaymentMethod.Id,
                    PaymentMethodType = "Stripe",
                    PaymentStatus = PaymentStatus.Paid,
                    ShippingAddress = dto.ShippingAddress.Trim(),
                    PhoneNumber = dto.ContactNumber.Trim(),
                    TotalAmount = 0
                };

                _context.Orders.Add(order);

                decimal orderTotal = 0;

                foreach (var cartItem in cart.CartItems)
                {
                    var product = cartItem.Product;

                    decimal unitPrice = product.Price;

                    var now = DateTime.UtcNow;

                    var activeDeal = await _context.Deals
                        .Where(x =>
                            x.ProductId == product.Id &&
                            x.IsActive &&
                            x.StartDate <= now &&
                            x.EndDate >= now)
                        .OrderByDescending(x =>
                            x.DiscountPercentage)
                        .FirstOrDefaultAsync();

                    if (activeDeal != null)
                    {
                        unitPrice =
                            product.Price -
                            (
                                product.Price *
                                activeDeal.DiscountPercentage /
                                100
                            );
                    }

                    decimal itemTotal =
                        unitPrice * cartItem.Quantity;

                    order.OrderItems.Add(new OrderItem
                    {
                        ProductId = product.Id,
                        Quantity = cartItem.Quantity,
                        UnitPrice = Math.Round(unitPrice, 2),
                        TotalPrice = Math.Round(itemTotal, 2)
                    });

                    orderTotal += itemTotal;

                    product.Stock -= cartItem.Quantity;
                }

                order.TotalAmount = Math.Round(orderTotal, 2);

                // Persist a transaction record so the dashboard
                // can show the Stripe reference.
                var transactionRecord = new Transaction
                {
                    Order = order,
                    PaymentMethodId = stripePaymentMethod.Id,
                    PaymentMethod = stripePaymentMethod,
                    TransactionReference =
                        $"STRIPE-{paymentIntent.Id}",
                    GatewayTransactionId = paymentIntent.Id,
                    Status = PaymentStatus.Paid,
                    Amount = order.TotalAmount,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Transactions.Add(transactionRecord);

                // Clear the cart
                _context.CartItems.RemoveRange(cart.CartItems);
                cart.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // Reload with includes for the response
                await _context.Entry(order)
                    .Collection(x => x.OrderItems)
                    .Query()
                    .Include(x => x.Product)
                    .LoadAsync();

                return MapToResponse(order);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static OrderResponseDto MapToResponse(Order order)
        {
            return new OrderResponseDto
            {
                OrderId = order.Id,
                OrderDate = order.CreatedAt,
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(),
                ShippingAddress = order.ShippingAddress ?? string.Empty,
                PaymentMethod = order.PaymentMethodType ?? string.Empty,
                TrackingNumber = order.Shipping?.TrackingNumber,
                Items = order.OrderItems?
                    .Select(x => new OrderItemResponseDto
                    {
                        ProductId = x.ProductId,
                        ProductName = x.Product?.Name ?? string.Empty,
                        Quantity = x.Quantity,
                        UnitPrice = x.UnitPrice,
                        TotalPrice = x.TotalPrice
                    })
                    .ToList()
                    ?? new List<OrderItemResponseDto>()
            };
        }

    }
}
