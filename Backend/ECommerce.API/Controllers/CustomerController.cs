using System.Security.Claims;
using ECommerce.API.DTOs.Customer;
using ECommerce.API.DTOs.Deal;
using ECommerce.API.Data;
using ECommerce.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Customer")]
    public class CustomerController : ControllerBase
    {
        private readonly ICustomerService _customerService;
        private readonly ApplicationDbContext _context;

        public CustomerController(
            ICustomerService customerService,
            ApplicationDbContext context)
        {
            _customerService =
                customerService;
            _context = context;
        }


        // =========================================================
        // CUSTOMER DASHBOARD
        // =========================================================

        [HttpGet("dashboard")]
        public IActionResult Dashboard()
        {
            return Ok(new
            {
                message =
                    "Welcome to Customer Dashboard",

                role = "Customer"
            });
        }


        // =========================================================
        // GET CUSTOMER PROFILE
        // =========================================================

        [HttpGet("profile")]
        public async Task<IActionResult>
            GetProfile()
        {
            try
            {
                var customerId =
                    GetUserId();

                var profile =
                    await _customerService
                        .GetProfileAsync(
                            customerId);

                return Ok(profile);
            }
            catch (Exception ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // UPDATE CUSTOMER PROFILE
        // =========================================================

        [HttpPut("profile")]
        public async Task<IActionResult>
            UpdateProfile(
                UpdateCustomerProfileDto dto)
        {
            try
            {
                var customerId =
                    GetUserId();

                var profile =
                    await _customerService
                        .UpdateProfileAsync(
                            customerId,
                            dto);

                return Ok(profile);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // CHANGE PASSWORD
        // =========================================================

        [HttpPut("change-password")]
        public async Task<IActionResult>
            ChangePassword(
                ChangeCustomerPasswordDto dto)
        {
            try
            {
                var customerId =
                    GetUserId();

                await _customerService
                    .ChangePasswordAsync(
                        customerId,
                        dto);

                return Ok(new
                {
                    message =
                        "Password changed successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // GET PRODUCTS
        // =========================================================

        [AllowAnonymous]
        [HttpGet("products")]
        public async Task<IActionResult>
            GetProducts()
        {
            var products =
                await _customerService
                    .GetProductsAsync();

            return Ok(products);
        }


        // =========================================================
        // GET PRODUCT BY ID
        // =========================================================

        [AllowAnonymous]
        [HttpGet("products/{id:int}")]
        public async Task<IActionResult>
            GetProduct(int id)
        {
            var product =
                await _customerService
                    .GetProductByIdAsync(id);

            if (product == null)
            {
                return NotFound(new
                {
                    message =
                        "Product not found."
                });
            }

            return Ok(product);
        }


        // =========================================================
        // GET ACTIVE DEALS (PHASE 21.8 — Customer Deal Display)
        // =========================================================

        [AllowAnonymous]
        [HttpGet("deals")]
        public async Task<IActionResult> GetActiveDeals()
        {
            var now = DateTime.UtcNow;

            var deals = await _context.Deals
                .AsNoTracking()
                .Include(d => d.Product)
                .Include(d => d.Seller)
                .Where(d =>
                    d.IsActive &&
                    d.StartDate <= now &&
                    d.EndDate >= now &&
                    d.Product != null &&
                    d.Product.IsActive)
                .OrderByDescending(d => d.DiscountPercentage)
                .Select(d => new DealResponseDto
                {
                    Id = d.Id,

                    ProductId = d.ProductId,

                    ProductName =
                        d.Product != null
                            ? d.Product.Name
                            : string.Empty,

                    OriginalPrice =
                        d.Product != null
                            ? d.Product.Price
                            : 0,

                    DiscountPercentage =
                        d.DiscountPercentage,

                    DiscountAmount =
                        d.Product != null
                            ? Math.Round(
                                d.Product.Price *
                                d.DiscountPercentage / 100,
                                2)
                            : 0,

                    DealPrice =
                        d.Product != null
                            ? Math.Round(
                                d.Product.Price -
                                (d.Product.Price *
                                 d.DiscountPercentage / 100),
                                2)
                            : 0,

                    StartDate = d.StartDate,

                    EndDate = d.EndDate,

                    IsActive = d.IsActive,

                    IsCurrentlyActive = true,

                    SellerId = d.SellerId,

                    SellerName =
                        d.Seller != null
                            ? d.Seller.FullName
                            : string.Empty
                })
                .ToListAsync();

            return Ok(deals);
        }


        // =========================================================
        // GET USER ID FROM JWT
        // =========================================================

        private int GetUserId()
        {
            var claim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                throw new UnauthorizedAccessException();
            }

            return int.Parse(
                claim.Value);
        }


        // =========================================================
        // GET CART
        // =========================================================

        [HttpGet("cart")]
        public async Task<IActionResult> GetCart()
        {
            var customerId = GetUserId();
            var result = await _customerService.GetCartAsync(customerId);
            return Ok(result);
        }


        // =========================================================
        // ADD TO CART
        // =========================================================

        [HttpPost("cart")]
        public async Task<IActionResult> AddToCart([FromBody] AddToCartDto dto)
        {
            try
            {
                var customerId = GetUserId();
                var result = await _customerService.AddToCartAsync(customerId, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // =========================================================
        // UPDATE CART ITEM
        // =========================================================

        [HttpPut("cart/{id:int}")]
        public async Task<IActionResult> UpdateCartItem(int id, [FromBody] UpdateCartItemDto dto)
        {
            try
            {
                var customerId = GetUserId();
                var result = await _customerService.UpdateCartItemAsync(customerId, id, dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // =========================================================
        // REMOVE FROM CART
        // =========================================================

        [HttpDelete("cart/{id:int}")]
        public async Task<IActionResult> RemoveFromCart(int id)
        {
            try
            {
                var customerId = GetUserId();
                var result = await _customerService.RemoveFromCartAsync(customerId, id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // =========================================================
        // CLEAR CART
        // =========================================================

        [HttpDelete("cart")]
        public async Task<IActionResult> ClearCart()
        {
            try
            {
                var customerId = GetUserId();
                var result = await _customerService.ClearCartAsync(customerId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }


        // =========================================================
        // CHECKOUT
        // =========================================================

        [HttpPost("checkout")]
        public async Task<IActionResult>
            Checkout(
                CheckoutDto dto)
        {
            try
            {
                var customerId =
                    GetUserId();

                var order =
                    await _customerService
                        .CheckoutAsync(
                            customerId,
                            dto);

                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // GET MY ORDERS
        // =========================================================

        [HttpGet("orders")]
        public async Task<IActionResult>
            GetMyOrders()
        {
            try
            {
                var customerId =
                    GetUserId();

                var orders =
                    await _customerService
                        .GetMyOrdersAsync(
                            customerId);

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // GET ORDER DETAILS
        // =========================================================

        [HttpGet("orders/{id:int}")]
        public async Task<IActionResult>
            GetOrderDetails(
                int id)
        {
            try
            {
                var customerId =
                    GetUserId();

                var order =
                    await _customerService
                        .GetOrderDetailsAsync(
                            customerId,
                            id);

                return Ok(order);
            }
            catch (Exception ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // CANCEL ORDER
        // =========================================================

        [HttpPost("orders/{id:int}/cancel")]
        public async Task<IActionResult>
            CancelOrder(
                int id,
                CancelOrderDto dto)
        {
            try
            {
                var customerId =
                    GetUserId();

                await _customerService
                    .CancelOrderAsync(
                        customerId,
                        id,
                        dto);

                return Ok(new
                {
                    message =
                        "Order cancelled successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // REQUEST REFUND
        // =========================================================

        [HttpPost("orders/{id:int}/refund")]
        public async Task<IActionResult>
            RequestRefund(
                int id,
                RefundRequestDto dto)
        {
            try
            {
                var customerId =
                    GetUserId();

                var refund =
                    await _customerService
                        .RequestRefundAsync(
                            customerId,
                            id,
                            dto);

                return Ok(refund);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // ADD FEEDBACK
        // =========================================================

        [HttpPost("orders/{orderId:int}/products/{productId:int}/feedback")]
        public async Task<IActionResult>
            AddFeedback(
                int orderId,
                int productId,
                CreateFeedbackDto dto)
        {
            try
            {
                var customerId =
                    GetUserId();

                var feedback =
                    await _customerService
                        .AddFeedbackAsync(
                            customerId,
                            orderId,
                            productId,
                            dto);

                return Ok(feedback);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // GET PRODUCT FEEDBACK
        // =========================================================

        [AllowAnonymous]
        [HttpGet("products/{productId:int}/feedback")]
        public async Task<IActionResult>
            GetProductFeedback(
                int productId)
        {
            try
            {
                var feedback =
                    await _customerService
                        .GetProductFeedbackAsync(
                            productId);

                return Ok(feedback);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // PHASE 23 — REVIEW EDIT / DELETE / SUMMARY
        // =========================================================

        // GET /api/Customer/products/{productId}/reviews
        // Public. Returns rich review rows (reviewer name included).
        [AllowAnonymous]
        [HttpGet("products/{productId:int}/reviews")]
        public async Task<IActionResult>
            GetProductReviews(
                int productId)
        {
            try
            {
                var reviews = await _customerService
                    .GetProductReviewsAsync(
                        productId);

                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // GET /api/Customer/products/{productId}/reviews/mine
        // Customer-only. Returns the caller's own review (or null) so the
        // ProductDetails page can show Edit/Delete buttons next to it.
        [HttpGet("products/{productId:int}/reviews/mine")]
        public async Task<IActionResult>
            GetMyReview(
                int productId)
        {
            try
            {
                var customerId = GetUserId();

                var review = await _customerService
                    .GetMyReviewForProductAsync(
                        customerId,
                        productId);

                return Ok(review);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // GET /api/Customer/products/{productId}/reviews/summary
        // Public. Average rating + per-star counts for the star-distribution chart.
        [AllowAnonymous]
        [HttpGet("products/{productId:int}/reviews/summary")]
        public async Task<IActionResult>
            GetProductRatingSummary(
                int productId)
        {
            try
            {
                var summary = await _customerService
                    .GetProductRatingSummaryAsync(
                        productId);

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // PUT /api/Customer/reviews/{reviewId}
        // Customer-only. Ownership is enforced server-side.
        [HttpPut("reviews/{reviewId:int}")]
        public async Task<IActionResult>
            UpdateReview(
                int reviewId,
                UpdateFeedbackDto dto)
        {
            try
            {
                var customerId = GetUserId();

                var updated = await _customerService
                    .UpdateFeedbackAsync(
                        customerId,
                        reviewId,
                        dto);

                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        // DELETE /api/Customer/reviews/{reviewId}
        // Customer-only. Ownership is enforced server-side.
        [HttpDelete("reviews/{reviewId:int}")]
        public async Task<IActionResult>
            DeleteReview(
                int reviewId)
        {
            try
            {
                var customerId = GetUserId();

                await _customerService
                    .DeleteFeedbackAsync(
                        customerId,
                        reviewId);

                return Ok(new
                {
                    message =
                        "Review deleted successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // START CONVERSATION
        // =========================================================

        [HttpPost("conversations")]
        public async Task<IActionResult>
            StartConversation(
                StartConversationDto dto)
        {
            try
            {
                var customerId =
                    GetUserId();

                var result =
                    await _customerService
                        .StartConversationAsync(
                            customerId,
                            dto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // GET CUSTOMER CONVERSATIONS
        // =========================================================

        [HttpGet("conversations")]
        public async Task<IActionResult>
            GetConversations()
        {
            try
            {
                var customerId =
                    GetUserId();

                var result =
                    await _customerService
                        .GetCustomerConversationsAsync(
                            customerId);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // GET CONVERSATION MESSAGES
        // =========================================================

        [HttpGet("conversations/{id:int}/messages")]
        public async Task<IActionResult>
            GetMessages(
                int id)
        {
            try
            {
                var customerId =
                    GetUserId();

                var result =
                    await _customerService
                        .GetConversationMessagesAsync(
                            customerId,
                            id);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // SEND MESSAGE
        // =========================================================

        [HttpPost("conversations/{id:int}/messages")]
        public async Task<IActionResult>
            SendMessage(
                int id,
                SendMessageDto dto)
        {
            try
            {
                var customerId =
                    GetUserId();

                var result =
                    await _customerService
                        .SendMessageAsync(
                            customerId,
                            id,
                            dto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }


        // =========================================================
        // PHASE 24 — READ / UNREAD MESSAGE SYSTEM (customer)
        // =========================================================

        [HttpPut("messages/{messageId:int}/read")]
        public async Task<IActionResult>
            MarkMessageRead(
                int messageId)
        {
            try
            {
                var customerId = GetUserId();

                await _customerService
                    .MarkMessageReadAsync(
                        customerId,
                        messageId);

                return Ok(new
                {
                    message =
                        "Message marked as read."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("messages/unread-count")]
        public async Task<IActionResult>
            GetUnreadMessageCount()
        {
            try
            {
                var customerId = GetUserId();

                var count = await _customerService
                    .GetUnreadMessageCountAsync(
                        customerId);

                return Ok(new
                {
                    unreadCount = count
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }
    }
}