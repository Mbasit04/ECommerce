using ECommerce.API.DTOs.Seller;

namespace ECommerce.API.Interfaces
{
    public interface ISellerService
    {
        Task<SellerProductResponseDto>
            AddProductAsync(
                CreateSellerProductDto dto,
                int sellerId);

        Task<List<SellerProductResponseDto>>
            GetMyProductsAsync(
                int sellerId);

        Task<SellerProductResponseDto?>
            GetMyProductByIdAsync(
                int productId,
                int sellerId);

        Task<SellerProductResponseDto>
            UpdateProductAsync(
                int productId,
                UpdateSellerProductDto dto,
                int sellerId);

        Task DeleteProductAsync(
            int productId,
            int sellerId);

        Task UpdateStockAsync(
            int productId,
            UpdateStockDto dto,
            int sellerId);

        Task<List<StockMovementResponseDto>>
            GetStockHistoryAsync(
                int productId,
                int sellerId);

        Task<List<StockMovementResponseDto>>
            GetAllStockHistoryAsync(
                int sellerId);

        Task<DealResponseDto>
            CreateDealAsync(
                CreateDealDto dto,
                int sellerId);

        Task<List<DealResponseDto>>
            GetMyDealsAsync(
                int sellerId);

        Task<DealResponseDto?>
            GetMyDealByIdAsync(
                int dealId,
                int sellerId);

        Task<DealResponseDto>
            UpdateDealAsync(
                int dealId,
                UpdateDealDto dto,
                int sellerId);

        Task DeleteDealAsync(
            int dealId,
            int sellerId);

        Task<SellerProfileResponseDto>
            GetProfileAsync(
            int sellerId);

        Task<SellerProfileResponseDto>
            UpdateProfileAsync(
                int sellerId,
                UpdateSellerProfileDto dto);

        Task<List<SellerOrderResponseDto>>
            GetMyOrdersAsync(
                int sellerId);

        Task<SellerOrderResponseDto>
            UpdateShippingAsync(
                int orderId,
                UpdateShippingDto dto,
                int sellerId);

        Task<SellerDashboardResponseDto>
         GetDashboardAsync(int sellerId);

        Task ChangePasswordAsync(
         int sellerId,
         ChangeSellerPasswordDto dto);

        Task<CreateSellerProductResponseDto>
        AddProductAsync(
        int sellerId,
        CreateSellerProductDto dto);

        Task<List<SellerCategoryResponseDto>>
            GetCategoriesAsync();

        Task<CreateSellerProductResponseDto>
       UpdateProductAsync(
        int sellerId,
        int productId,
        UpdateSellerProductDto dto);

        Task<SellerStockResponseDto>
        UpdateStockAsync(
        int sellerId,
        int productId,
        string action,
        UpdateSellerStockDto dto);

        // =========================================================
        // SELLER SHIPPING (Step 20.1 + 20.2)
        // =========================================================

        Task<List<SellerShippingDto>>
            GetSellerShippingAsync(
                int sellerId);

        Task<SellerShippingDto?>
            GetSellerShippingByOrderIdAsync(
                int orderId,
                int sellerId);

        Task UpdateTrackingNumberAsync(
            int orderId,
            int sellerId,
            string trackingNumber);

        Task ShipOrderAsync(
            int orderId,
            int sellerId);

        Task DeliverOrderAsync(
            int orderId,
            int sellerId);

        // =========================================================
        // PHASE 23 — SELLER REVIEW VISIBILITY
        // =========================================================

        // Reviews only for products owned by the seller in JWT — sellers
        // can read what their customers are saying but cannot moderate.
        Task<List<SellerReviewDto>>
            GetSellerReviewsAsync(
                int sellerId);

        Task<SellerReviewDto?>
            GetSellerReviewByIdAsync(
                int reviewId,
                int sellerId);

        // =========================================================
        // PHASE 24 — CONTACT SELLER (seller-side inbox + reply)
        // =========================================================

        Task<List<SellerMessageConversationDto>>
            GetSellerConversationsAsync(
                int sellerId);

        Task<SellerMessageDetailsDto?>
            GetSellerConversationAsync(
                int sellerId,
                int customerId);

        Task<SellerMessageDto>
            ReplyToCustomerAsync(
                int sellerId,
                SellerReplyDto dto);

        Task MarkSellerMessageReadAsync(
                int sellerId,
                int messageId);

        Task<int>
            GetSellerUnreadCountAsync(
                int sellerId);
    }
}
