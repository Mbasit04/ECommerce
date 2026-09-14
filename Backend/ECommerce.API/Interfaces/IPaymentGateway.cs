namespace ECommerce.API.Interfaces
{
    public interface IPaymentGateway
    {
        Task<string> CreatePaymentAsync(
            int orderId,
            decimal amount);

        Task<bool> VerifyPaymentAsync(
            string paymentId);
    }
}