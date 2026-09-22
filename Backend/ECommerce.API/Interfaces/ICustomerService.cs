using ECommerce.API.DTOs.Customer;

namespace ECommerce.API.Interfaces
{
    public interface ICustomerService
    {
        Task<CustomerProfileResponseDto>
            GetProfileAsync(
                int customerId);

        Task<CustomerProfileResponseDto>
            UpdateProfileAsync(
                int customerId,
                UpdateCustomerProfileDto dto);

        Task ChangePasswordAsync(
            int customerId,
            ChangeCustomerPasswordDto dto);

        Task<List<CustomerProductResponseDto>>
            GetProductsAsync();

        Task<CustomerProductResponseDto?>
            GetProductByIdAsync(
                int productId);

        Task<CartResponseDto> GetCartAsync(
            int customerId);

        Task<CartResponseDto> AddToCartAsync(
            int customerId,
            AddToCartDto dto);

        Task<CartResponseDto> UpdateCartItemAsync(
            int customerId,
            int cartItemId,
            UpdateCartItemDto dto);

        Task<CartResponseDto> RemoveFromCartAsync(
            int customerId,
            int cartItemId);

        Task<CartResponseDto> ClearCartAsync(
            int customerId);

        Task<OrderResponseDto>
        CheckoutAsync(
        int customerId,
        CheckoutDto dto);

        Task<List<OrderListResponseDto>>
        GetMyOrdersAsync(
        int customerId);

        Task<OrderDetailsResponseDto>
        GetOrderDetailsAsync(
        int customerId,
        int orderId);

        Task<bool> CancelOrderAsync(
        int customerId,
        int orderId,
        CancelOrderDto dto);

        Task<RefundResponseDto>
        RequestRefundAsync(
        int customerId,
        int orderId,
        RefundRequestDto dto);

        Task<FeedbackResponseDto>
        AddFeedbackAsync(
        int customerId,
        int orderId,
        int productId,
        CreateFeedbackDto dto);

        Task<List<FeedbackResponseDto>>
        GetProductFeedbackAsync(
        int productId);

        // =========================================================
        // PHASE 23 — REVIEW OWNERSHIP EDIT / DELETE + SUMMARY
        // =========================================================

        Task<List<CustomerReviewDto>>
        GetProductReviewsAsync(
        int productId);

        Task<CustomerReviewDto?>
        GetMyReviewForProductAsync(
        int customerId,
        int productId);

        Task<FeedbackResponseDto>
        UpdateFeedbackAsync(
        int customerId,
        int feedbackId,
        UpdateFeedbackDto dto);

        Task<bool>
        DeleteFeedbackAsync(
        int customerId,
        int feedbackId);

        Task<RatingSummaryDto>
        GetProductRatingSummaryAsync(
        int productId);

        // =========================================================
        // PHASE 24 — READ / UNREAD MESSAGE SYSTEM (customer-side)
        // =========================================================

        Task MarkMessageReadAsync(
            int customerId,
            int messageId);

        Task<int> GetUnreadMessageCountAsync(
            int customerId);

        Task<ConversationDetailsResponseDto> StartConversationAsync(
        int customerId,
        StartConversationDto dto);

        Task<MessageResponseDto> SendMessageAsync(
            int customerId,
            int conversationId,
            SendMessageDto dto);

        Task<List<ConversationListResponseDto>> GetCustomerConversationsAsync(
            int customerId);

        Task<ConversationDetailsResponseDto> GetConversationMessagesAsync(
            int customerId,
            int conversationId);
    }
}