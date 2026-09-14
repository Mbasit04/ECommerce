using ECommerce.API.DTOs.Admin;
using ECommerce.API.DTOs.Deal;
using ECommerce.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly IDealService _dealService;

        public AdminController(
            IAdminService adminService,
            IDealService dealService)
        {
            _adminService = adminService;
            _dealService = dealService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var result = await _adminService.GetDashboardAsync();

            return Ok(result);
        }

        [HttpGet("sellers")]
        public async Task<IActionResult> GetSellers()
        {
            var sellers = await _adminService.GetSellersAsync();

            return Ok(sellers);
        }

        [HttpGet("sellers/{id:int}")]
        public async Task<IActionResult> GetSeller(int id)
        {
            var seller = await _adminService.GetSellerByIdAsync(id);

            if (seller == null)
            {
                return NotFound(new { message = "Seller not found." });
            }

            return Ok(seller);
        }

        [HttpPost("sellers")]
        public async Task<IActionResult> CreateSeller(CreateSellerDto dto)
        {
            try
            {
                var result = await _adminService.CreateSellerAsync(dto);

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

        [HttpPut("sellers/{id:int}")]
        public async Task<IActionResult> UpdateSeller(int id, UpdateSellerDto dto)
        {
            try
            {
                var result = await _adminService.UpdateSellerAsync(id, dto);

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

        [HttpDelete("sellers/{id:int}")]
        public async Task<IActionResult> DeleteSeller(int id)
        {
            try
            {
                var result = await _adminService.DeleteSellerAsync(id);

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

        [HttpGet("customers")]
        public async Task<IActionResult> GetCustomers()
        {
            var customers = await _adminService.GetCustomersAsync();

            return Ok(customers);
        }

        [HttpGet("customers/{id:int}")]
        public async Task<IActionResult> GetCustomer(int id)
        {
            var customer = await _adminService.GetCustomerByIdAsync(id);

            if (customer == null)
            {
                return NotFound(new { message = "Customer not found." });
            }

            return Ok(customer);
        }

        [HttpPost("customers")]
        public async Task<IActionResult> CreateCustomer(CreateCustomerDto dto)
        {
            try
            {
                var result = await _adminService.CreateCustomerAsync(dto);

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

        [HttpPut("customers/{id:int}")]
        public async Task<IActionResult> UpdateCustomer(int id, UpdateCustomerDto dto)
        {
            try
            {
                var result = await _adminService.UpdateCustomerAsync(id, dto);

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

        [HttpDelete("customers/{id:int}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            try
            {
                var result = await _adminService.DeleteCustomerAsync(id);

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
        // DEAL MANAGEMENT (admin-only mirror of /api/Deals)
        // =========================================================

        [HttpGet("/api/Admin/deals")]
        public async Task<IActionResult> GetDeals()
        {
            var deals = await _dealService.GetAllAsync();

            return Ok(deals);
        }

        [HttpGet("/api/Admin/deals/{id:int}")]
        public async Task<IActionResult> GetDealById(int id)
        {
            var deal = await _dealService.GetByIdAsync(id);

            if (deal == null)
            {
                return NotFound(new { message = "Deal not found." });
            }

            return Ok(deal);
        }

        [HttpPost("/api/Admin/deals")]
        public async Task<IActionResult> CreateDeal([FromBody] CreateDealDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

                var deal = await _dealService.CreateAsync(dto, userId, isAdmin: true);

                return CreatedAtAction(nameof(GetDealById), new { id = deal.Id }, deal);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("/api/Admin/deals/{id:int}")]
        public async Task<IActionResult> UpdateDeal(int id, [FromBody] UpdateDealDto dto)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

                var updated = await _dealService.UpdateAsync(id, dto, userId, isAdmin: true);

                if (!updated)
                {
                    return NotFound(new { message = "Deal not found." });
                }

                return Ok(new { message = "Deal updated successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("/api/Admin/deals/{id:int}")]
        public async Task<IActionResult> DeleteDeal(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

                var deleted = await _dealService.DeleteAsync(id, userId, isAdmin: true);

                if (!deleted)
                {
                    return NotFound(new { message = "Deal not found." });
                }

                return Ok(new { message = "Deal deleted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
