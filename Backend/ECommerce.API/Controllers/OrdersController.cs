using System.Security.Claims;
using ECommerce.API.DTOs.Order;
using ECommerce.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(
            IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> Create(
            CreateOrderDto dto)
        {
            try
            {
                var customerId = GetUserId();

                var order =
                    await _orderService.CreateAsync(
                        dto,
                        customerId);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = order.Id },
                    order);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("my-orders")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> MyOrders()
        {
            var customerId = GetUserId();

            var orders =
                await _orderService.GetMyOrdersAsync(
                    customerId);

            return Ok(orders);
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetById(
            int id)
        {
            var customerId = GetUserId();

            var order =
                await _orderService.GetByIdAsync(
                    id,
                    customerId);

            if (order == null)
            {
                return NotFound(new
                {
                    message = "Order not found."
                });
            }

            return Ok(order);
        }

        [HttpGet("admin/all")]
        [HttpGet("/api/Admin/orders")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var orders =
                await _orderService.GetAllAsync();

            return Ok(orders);
        }

        [HttpGet("/api/Admin/orders/{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminOrderById(int id)
        {
            var order = await _orderService.GetByIdForAdminAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found." });
            }

            return Ok(order);
        }

        [HttpPut("/api/Admin/orders/{id:int}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateAdminOrderStatus(int id, [FromBody] UpdateAdminOrderStatusDto dto)
        {
            try
            {
                var success = await _orderService.UpdateStatusAsync(id, dto.Status, dto.TrackingNumber);

                if (!success)
                {
                    return NotFound(new { message = "Order not found." });
                }

                return Ok(new { message = "Order status updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetUserId()
        {
            var claim = User.FindFirst(
                ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                throw new UnauthorizedAccessException();
            }

            return int.Parse(claim.Value);
        }
    }

    public class UpdateAdminOrderStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public string? TrackingNumber { get; set; }
    }
}