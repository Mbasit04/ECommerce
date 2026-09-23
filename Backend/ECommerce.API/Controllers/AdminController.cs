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

        [HttpPut("/api/Admin/deals/{id:int}/toggle-active")]
        public async Task<IActionResult> ToggleDealActive(int id)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

                var toggled = await _dealService.ToggleActiveAsync(id, userId, isAdmin: true);

                if (!toggled)
                {
                    return NotFound(new { message = "Deal not found." });
                }

                return Ok(new { message = "Deal active state toggled successfully." });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // =========================================================
        // SHIPPING — STEP 20.6 (Admin monitoring view)
        // =========================================================

        [HttpGet("shipping")]
        public async Task<IActionResult>
            GetAllShipping()
        {
            try
            {
                var shipping =
                    await _adminService
                        .GetAllShippingAsync();

                return Ok(shipping);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("shipping/{orderId:int}")]
        public async Task<IActionResult>
            GetShippingByOrderId(
                int orderId)
        {
            try
            {
                var shipping =
                    await _adminService
                        .GetShippingByOrderIdAsync(
                            orderId);

                if (shipping == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Shipping information not found."
                    });
                }

                return Ok(shipping);
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
        // REFUND MANAGEMENT — PHASE 22
        // =========================================================

        [HttpGet("refunds")]
        public async Task<IActionResult> GetAllRefunds()
        {
            try
            {
                var refunds =
                    await _adminService
                        .GetAllRefundsAsync();

                return Ok(refunds);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("refunds/{refundId:int}")]
        public async Task<IActionResult>
            GetRefundById(int refundId)
        {
            try
            {
                var refund =
                    await _adminService
                        .GetRefundByIdAsync(refundId);

                if (refund == null)
                {
                    return NotFound(new
                    {
                        message = "Refund not found."
                    });
                }

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

        [HttpPut("refunds/{refundId:int}/approve")]
        public async Task<IActionResult>
            ApproveRefund(int refundId)
        {
            try
            {
                var approved =
                    await _adminService
                        .ApproveRefundAsync(refundId);

                if (!approved)
                {
                    return NotFound(new
                    {
                        message = "Refund not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Refund approved successfully."
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

        [HttpPut("refunds/{refundId:int}/reject")]
        public async Task<IActionResult>
            RejectRefund(int refundId)
        {
            try
            {
                var rejected =
                    await _adminService
                        .RejectRefundAsync(refundId);

                if (!rejected)
                {
                    return NotFound(new
                    {
                        message = "Refund not found."
                    });
                }

                return Ok(new
                {
                    message =
                        "Refund rejected successfully."
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
        // PHASE 23 — REVIEW MANAGEMENT
        // =========================================================

        [HttpGet("reviews")]
        public async Task<IActionResult>
            GetAllReviews()
        {
            try
            {
                var reviews =
                    await _adminService
                        .GetAllReviewsAsync();

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

        [HttpGet("reviews/{reviewId:int}")]
        public async Task<IActionResult>
            GetReviewById(
                int reviewId)
        {
            try
            {
                var review =
                    await _adminService
                        .GetReviewByIdAsync(reviewId);

                if (review == null)
                {
                    return NotFound(new
                    {
                        message = "Review not found."
                    });
                }

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

        [HttpDelete("reviews/{reviewId:int}")]
        public async Task<IActionResult>
            DeleteReview(
                int reviewId)
        {
            try
            {
                await _adminService
                    .DeleteReviewAsync(reviewId);

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
        // PHASE 26 — ROLE PERMISSIONS CONSOLE
        // =========================================================

        [HttpGet("roles")]
        public async Task<IActionResult>
            GetRoles()
        {
            try
            {
                var roles = await _adminService.GetRolesAsync();
                return Ok(roles);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("roles/{roleId:int}/users")]
        public async Task<IActionResult>
            GetUsersInRole(int roleId)
        {
            try
            {
                var users = await _adminService
                    .GetUsersInRoleAsync(roleId);

                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpGet("role-users")]
        public async Task<IActionResult>
            GetAllRoleUsers()
        {
            try
            {
                var users = await _adminService
                    .GetAllUsersWithRolesAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("users/{userId:int}/role")]
        public async Task<IActionResult>
            UpdateUserRole(
                int userId,
                UpdateUserRoleDto dto)
        {
            try
            {
                var adminId = GetUserId();

                await _adminService.UpdateUserRoleAsync(
                    adminId,
                    userId,
                    dto.RoleId);

                return Ok(new
                {
                    message =
                        "User role updated successfully."
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

        [HttpGet("permissions")]
        public async Task<IActionResult>
            GetPermissions()
        {
            try
            {
                var perms = await _adminService.GetAllPermissionsAsync();
                return Ok(perms);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message
                });
            }
        }

        [HttpPut("permissions/{roleId:int}/{moduleKey}")]
        public async Task<IActionResult>
            UpdatePermission(
                int roleId,
                string moduleKey,
                UpdateRolePermissionDto dto)
        {
            try
            {
                var updated = await _adminService.UpdatePermissionAsync(
                    roleId,
                    moduleKey,
                    dto.Capability);

                if (updated == null)
                {
                    return NotFound(new
                    {
                        message =
                            "Permission entry not found."
                    });
                }

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

        private int GetUserId()
        {
            var claim = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier);

            if (claim == null)
            {
                throw new UnauthorizedAccessException();
            }

            return int.Parse(claim.Value);
        }
    }
}
