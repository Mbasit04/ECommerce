using System.Security.Claims;
using ECommerce.API.DTOs.Stock;
using ECommerce.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Seller")]
    public class StockController : ControllerBase
    {
        private readonly IStockService _stockService;

        public StockController(IStockService stockService)
        {
            _stockService = stockService;
        }

        [HttpPost("{productId:int}/add")]
        public async Task<IActionResult> AddStock(
            int productId,
            StockOperationDto dto)
        {
            try
            {
                var userId = GetUserId();

                var isAdmin = User.IsInRole("Admin");

                var newStock =
                    await _stockService.AddStockAsync(
                        productId,
                        dto,
                        userId,
                        isAdmin);

                if (newStock == null)
                {
                    return NotFound(new
                    {
                        message = "Product not found."
                    });
                }

                return Ok(new
                {
                    message = "Stock added successfully.",
                    productId,
                    addedQuantity = dto.Quantity,
                    currentStock = newStock
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPost("{productId:int}/remove")]
        public async Task<IActionResult> RemoveStock(
            int productId,
            StockOperationDto dto)
        {
            try
            {
                var userId = GetUserId();

                var isAdmin = User.IsInRole("Admin");

                var newStock =
                    await _stockService.RemoveStockAsync(
                        productId,
                        dto,
                        userId,
                        isAdmin);

                if (newStock == null)
                {
                    return NotFound(new
                    {
                        message = "Product not found."
                    });
                }

                return Ok(new
                {
                    message = "Stock removed successfully.",
                    productId,
                    removedQuantity = dto.Quantity,
                    currentStock = newStock
                });
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("{productId:int}/movements")]
        public async Task<IActionResult> GetMovements(
            int productId)
        {
            try
            {
                var userId = GetUserId();

                var isAdmin = User.IsInRole("Admin");

                var movements =
                    await _stockService.GetMovementsAsync(
                        productId,
                        userId,
                        isAdmin);

                return Ok(movements);
            }
            catch (UnauthorizedAccessException)
            {
                return Forbid();
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("/api/Admin/stocks")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminStocks()
        {
            var stocks = await _stockService.GetAdminStocksAsync();
            return Ok(stocks);
        }

        [HttpGet("/api/Admin/stocks/{productId:int}/history")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminStockHistory(int productId)
        {
            var history = await _stockService.GetAdminStockHistoryAsync(productId);
            return Ok(history);
        }

        private int GetUserId()
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                throw new UnauthorizedAccessException();
            }

            return int.Parse(userIdClaim.Value);
        }
    }
}
