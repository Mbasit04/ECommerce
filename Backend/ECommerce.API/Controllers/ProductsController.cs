using ECommerce.API.DTOs.Product;
using ECommerce.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ECommerce.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/Admin/[controller]")]
    [Authorize(Roles = "Admin,Seller")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(
            IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _productService.GetAllAsync();

            return Ok(products);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetByIdAsync(id);

            if (product == null)
            {
                return NotFound(new
                {
                    message = "Product not found."
                });
            }

            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            CreateProductDto dto)
        {
            try
            {
                var product =
                    await _productService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = product.Id },
                    product);
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
            UpdateProductDto dto)
        {
            try
            {
                var updated =
                    await _productService.UpdateAsync(id, dto);

                if (!updated)
                {
                    return NotFound(new
                    {
                        message = "Product not found."
                    });
                }

                return Ok(new
                {
                    message = "Product updated successfully."
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

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var deleted =
                    await _productService.DeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(new
                    {
                        message = "Product not found."
                    });
                }

                return Ok(new
                {
                    message = "Product deleted successfully."
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