using ECommerce.API.Data;
using ECommerce.API.DTOs.Payment;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class PaymentService
    {
        private readonly ApplicationDbContext _context;

        public PaymentService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TransactionResponseDto>
            ProcessCODAsync(
                int orderId,
                int customerId)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(x =>
                    x.Id == orderId &&
                    x.CustomerId == customerId);

            if (order == null)
            {
                throw new Exception(
                    "Order not found.");
            }

            var paymentMethod = await _context.PaymentMethods
                .SingleOrDefaultAsync(x =>
                    x.Id == order.PaymentMethodId);

            if (paymentMethod == null ||
                !string.Equals(
                    paymentMethod.Name,
                    "COD",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception(
                    "This order is not a COD order.");
            }

            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                throw new Exception(
                    "Order has already been paid.");
            }

            var existingTransaction =
                await _context.Transactions
                    .Include(x => x.PaymentMethod)
                    .FirstOrDefaultAsync(x =>
                        x.OrderId == orderId);

            if (existingTransaction != null)
            {
                return MapTransaction(
                    existingTransaction);
            }

            var transaction =
                new Transaction
                {
                    OrderId = order.Id,

                    TransactionReference =
                        GenerateReference(),

                    PaymentMethodId = paymentMethod.Id,

                    PaymentMethod = paymentMethod,

                    Status =
                        PaymentStatus.Pending,

                    Amount =
                        order.TotalAmount,

                    CreatedAt =
                        DateTime.UtcNow
                };

            order.PaymentStatus =
                PaymentStatus.Pending;

            _context.Transactions.Add(transaction);

            await _context.SaveChangesAsync();

            return MapTransaction(transaction);
        }

        public async Task<TransactionResponseDto?>
            GetTransactionAsync(
                int orderId,
                int customerId)
        {
            var transaction =
                await _context.Transactions
                .Include(x => x.Order)
                .Include(x => x.PaymentMethod)
                .FirstOrDefaultAsync(x =>
                        x.OrderId == orderId &&
                        x.Order.CustomerId == customerId);

            if (transaction == null)
            {
                return null;
            }

            return MapTransaction(transaction);
        }

        public async Task<List<TransactionResponseDto>>
            GetAllTransactionsAsync()
        {
            return await _context.Transactions
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new TransactionResponseDto
                {
                    Id = x.Id,

                    OrderId = x.OrderId,

                    TransactionReference =
                        x.TransactionReference,

                    PaymentMethod =
                        x.PaymentMethod,

                    Status =
                        x.Status,

                    Amount =
                        x.Amount,

                    GatewayTransactionId =
                        x.GatewayTransactionId,

                    CreatedAt =
                        x.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<object> MarkCodPaymentAsPaidAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(x => x.PaymentMethod)
                .Include(x => x.Payment)
                .FirstOrDefaultAsync(x => x.Id == orderId);

            if (order == null)
            {
                throw new Exception("Order not found.");
            }

            bool isCod = string.Equals(order.PaymentMethodType, "COD", StringComparison.OrdinalIgnoreCase)
                || (order.PaymentMethod != null && string.Equals(order.PaymentMethod.Name, "COD", StringComparison.OrdinalIgnoreCase));

            if (!isCod)
            {
                throw new Exception("This order is not a COD order.");
            }

            if (order.PaymentStatus == PaymentStatus.Paid)
            {
                throw new Exception("Already collected");
            }

            var now = DateTime.UtcNow;
            order.PaymentStatus = PaymentStatus.Paid;
            order.UpdatedAt = now;

            var transaction = await _context.Transactions
                .FirstOrDefaultAsync(x => x.OrderId == orderId);

            if (transaction != null)
            {
                transaction.Status = PaymentStatus.Paid;
            }
            else
            {
                transaction = new Transaction
                {
                    OrderId = order.Id,
                    TransactionReference = $"TXN-COD-{now:yyyyMMddHHmmss}-{Guid.NewGuid():N}".Substring(0, 35).ToUpper(),
                    PaymentMethodId = order.PaymentMethodId,
                    Status = PaymentStatus.Paid,
                    Amount = order.TotalAmount,
                    CreatedAt = now
                };
                _context.Transactions.Add(transaction);
            }

            var payment = await _context.Payments
                .FirstOrDefaultAsync(x => x.OrderId == orderId);

            if (payment != null)
            {
                payment.PaymentStatus = "Paid";
                payment.PaidAt = now;
            }
            else
            {
                payment = new Payment
                {
                    OrderId = order.Id,
                    PaymentMethodId = order.PaymentMethodId,
                    Amount = order.TotalAmount,
                    PaymentStatus = "Paid",
                    PaidAt = now
                };
                _context.Payments.Add(payment);
            }

            await _context.SaveChangesAsync();

            return new
            {
                message = "COD payment marked as paid.",
                orderId = order.Id,
                paymentStatus = "Paid",
                paidAt = now
            };
        }

        private static string GenerateReference()
        {
            return
                $"TXN-{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}"
                .Substring(0, 35)
                .ToUpper();
        }

        private static TransactionResponseDto
            MapTransaction(Transaction transaction)
        {
            return new TransactionResponseDto
            {
                Id = transaction.Id,

                OrderId =
                    transaction.OrderId,

                TransactionReference =
                    transaction.TransactionReference,

                PaymentMethod =
                    transaction.PaymentMethod,

                Status =
                    transaction.Status,

                Amount =
                    transaction.Amount,

                GatewayTransactionId =
                    transaction.GatewayTransactionId,

                CreatedAt =
                    transaction.CreatedAt
            };
        }
    }
}
