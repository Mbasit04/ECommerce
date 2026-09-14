using ECommerce.API.DTOs.Customer;
using ECommerce.API.DTOs.Payment;

namespace ECommerce.API.Interfaces
{
    public interface IPaymentService
    {
        Task<PaymentIntentResponseDto> CreatePaymentIntentAsync(
            int customerId);

        Task<TransactionResponseDto> ProcessCODAsync(
            int orderId,
            int customerId);

        Task<TransactionResponseDto?> GetTransactionAsync(
            int orderId,
            int customerId);

        Task<List<TransactionResponseDto>>
            GetAllTransactionsAsync();

        Task<string>
        CreateRefundAsync(
        string paymentIntentId,
        decimal amount);

        Task<OrderResponseDto> ConfirmStripeCheckoutAsync(
            int customerId,
            StripeCheckoutConfirmDto dto);

        Task<object> MarkCodPaymentAsPaidAsync(
            int orderId);
    }
}
