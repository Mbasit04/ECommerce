using System.Security.Claims;
using ECommerce.API.DTOs.Deal;
using ECommerce.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin,Seller")]
    public class DealsController : ControllerBase
    {
        private readonly IDealService _dealService;

        public DealsController(IDealService dealService)
        {
            _dealService = dealService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var deals = await _dealService.GetAllAsync();

            return Ok(deals);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var deal = await _dealService.GetByIdAsync(id);

            if (deal == null)
            {
                return NotFound(new
                {
                    message = "Deal not found."
                });
            }

            return Ok(deal);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            CreateDealDto dto)
        {
            try
            {
                var userId = GetUserId();

                var isAdmin = User.IsInRole("Admin");

                var deal = await _dealService.CreateAsync(
                    dto,
                    userId,
                    isAdmin);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = deal.Id },
                    deal);
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

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateDealDto dto)
        {
            try
            {
                var userId = GetUserId();

                var isAdmin = User.IsInRole("Admin");

                var updated = await _dealService.UpdateAsync(
                    id,
                    dto,
                    userId,
                    isAdmin);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = "Deal not found."
                    });
                }

                return Ok(new
                {
                    message = "Deal updated successfully."
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

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var userId = GetUserId();

                var isAdmin = User.IsInRole("Admin");

                var deleted = await _dealService.DeleteAsync(
                    id,
                    userId,
                    isAdmin);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = "Deal not found."
                    });
                }

                return Ok(new
                {
                    message = "Deal deleted successfully."
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
}