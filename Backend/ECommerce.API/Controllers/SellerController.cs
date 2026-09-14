using System.Security.Claims;
using ECommerce.API.DTOs.Seller;
using ECommerce.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Seller")]
    public class SellerController : ControllerBase
    {
        private readonly ISellerService _sellerService;

        public SellerController(ISellerService sellerService)
        {
            _sellerService = sellerService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var claim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (claim == null)
                return Unauthorized();

            var sellerId = int.Parse(claim.Value);

            var result =
                await _sellerService.GetDashboardAsync(sellerId);

            return Ok(result);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var result =
                await _sellerService.GetCategoriesAsync();

            return Ok(result);
        }

        [HttpPost("products")]
        public async Task<IActionResult> AddProduct(
            CreateSellerProductDto dto)
        {
            try
            {
                var sellerId =
                    GetUserId();

                var product =
                    await _sellerService
                        .AddProductAsync(
                            dto,
                            sellerId);

                return Ok(product);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("products")]
        public async Task<IActionResult> GetMyProducts()
        {
            var sellerId =
                GetUserId();

            var products =
                await _sellerService
                    .GetMyProductsAsync(
                        sellerId);

            return Ok(products);
        }

        [HttpGet("products/{id:int}")]
        public async Task<IActionResult> GetMyProduct(int id)
        {
            var sellerId =
                GetUserId();

            var product =
                await _sellerService
                    .GetMyProductByIdAsync(
                        id,
                        sellerId);

            if (product == null)
            {
                return NotFound(new
                {
                    message = "Product not found."
                });
            }

            return Ok(product);
        }

        [HttpPut("products/{id}")]
        public async Task<IActionResult> UpdateProduct(
            int id,
            UpdateSellerProductDto dto)
        {
            var claim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (claim == null)
                return Unauthorized();

            var sellerId =
                int.Parse(claim.Value);

            try
            {
                var result =
                    await _sellerService.UpdateProductAsync(
                        sellerId,
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

        [HttpDelete("products/{id:int}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var sellerId =
                    GetUserId();

                await _sellerService
                    .DeleteProductAsync(
                        id,
                        sellerId);

                return Ok(new
                {
                    message =
                        "Product deactivated successfully."
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

        [HttpPut("products/{id:int}/stock")]
        public async Task<IActionResult> UpdateStock(
            int id,
            UpdateStockDto dto)
        {
            try
            {
                var sellerId =
                    GetUserId();

                await _sellerService
                    .UpdateStockAsync(
                        id,
                        dto,
                        sellerId);

                return Ok(new
                {
                    message =
                        "Stock updated successfully."
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

        [HttpPut("stocks/{id}/increase")]
        public async Task<IActionResult> IncreaseStock(
            int id,
            UpdateSellerStockDto dto)
        {
            var claim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (claim == null)
                return Unauthorized();

            var sellerId =
                int.Parse(claim.Value);

            try
            {
                var result =
                    await _sellerService.UpdateStockAsync(
                        sellerId,
                        id,
                        "increase",
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

        [HttpPut("stocks/{id}/decrease")]
        public async Task<IActionResult> DecreaseStock(
            int id,
            UpdateSellerStockDto dto)
        {
            var claim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (claim == null)
                return Unauthorized();

            var sellerId =
                int.Parse(claim.Value);

            try
            {
                var result =
                    await _sellerService.UpdateStockAsync(
                        sellerId,
                        id,
                        "decrease",
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

        [HttpGet("products/{id:int}/stock-history")]
        public async Task<IActionResult> GetStockHistory(int id)
        {
            try
            {
                var sellerId =
                    GetUserId();

                var history =
                    await _sellerService
                        .GetStockHistoryAsync(
                            id,
                            sellerId);

                return Ok(history);
            }
            catch (Exception ex)
            {
                return NotFound(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("stocks/history")]
        public async Task<IActionResult> GetAllStockHistory()
        {
            try
            {
                var sellerId =
                    GetUserId();

                var history =
                    await _sellerService
                        .GetAllStockHistoryAsync(sellerId);

                return Ok(history);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("deals")]
        public async Task<IActionResult> CreateDeal(
            CreateDealDto dto)
        {
            try
            {
                var sellerId =
                    GetUserId();

                var deal =
                    await _sellerService
                        .CreateDealAsync(
                            dto,
                            sellerId);

                return Ok(deal);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("deals")]
        public async Task<IActionResult> GetMyDeals()
        {
            var sellerId =
                GetUserId();

            var deals =
                await _sellerService
                    .GetMyDealsAsync(
                        sellerId);

            return Ok(deals);
        }

        [HttpGet("deals/{id:int}")]
        public async Task<IActionResult> GetMyDeal(int id)
        {
            var sellerId =
                GetUserId();

            var deal =
                await _sellerService
                    .GetMyDealByIdAsync(
                        id,
                        sellerId);

            if (deal == null)
            {
                return NotFound(new
                {
                    message = "Deal not found."
                });
            }

            return Ok(deal);
        }

        [HttpPut("deals/{id:int}")]
        public async Task<IActionResult> UpdateDeal(
            int id,
            UpdateDealDto dto)
        {
            try
            {
                var sellerId =
                    GetUserId();

                var deal =
                    await _sellerService
                        .UpdateDealAsync(
                            id,
                            dto,
                            sellerId);

                return Ok(deal);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpDelete("deals/{id:int}")]
        public async Task<IActionResult> DeleteDeal(int id)
        {
            try
            {
                var sellerId =
                    GetUserId();

                await _sellerService
                    .DeleteDealAsync(
                        id,
                        sellerId);

                return Ok(new
                {
                    message =
                        "Deal deactivated successfully."
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

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                var sellerId =
                    GetUserId();

                var profile =
                    await _sellerService
                        .GetProfileAsync(
                            sellerId);

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

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile(
            UpdateSellerProfileDto dto)
        {
            try
            {
                var sellerId =
                    GetUserId();

                var profile =
                    await _sellerService
                        .UpdateProfileAsync(
                            sellerId,
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

        [HttpGet("orders")]
        public async Task<IActionResult> GetMyOrders()
        {
            var sellerId =
                GetUserId();

            var orders =
                await _sellerService
                    .GetMyOrdersAsync(
                        sellerId);

            return Ok(orders);
        }

        [HttpPut("orders/{id:int}/shipping")]
        public async Task<IActionResult> UpdateShipping(
            int id,
            UpdateShippingDto dto)
        {
            try
            {
                var sellerId =
                    GetUserId();

                var order =
                    await _sellerService
                        .UpdateShippingAsync(
                            id,
                            dto,
                            sellerId);

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

        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(
            ChangeSellerPasswordDto dto)
        {
            var claim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier);

            if (claim == null)
                return Unauthorized();

            var sellerId =
                int.Parse(claim.Value);

            await _sellerService.ChangePasswordAsync(
                sellerId,
                dto);

            return Ok(new
            {
                message =
                    "Password changed successfully."
            });
        }

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
    }
}