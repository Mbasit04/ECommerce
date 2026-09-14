using ECommerce.API.Data;
using ECommerce.API.DTOs.Admin;
using ECommerce.API.Interfaces;
using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Services
{
    public class AdminService : IAdminService
    {
        private readonly ApplicationDbContext _context;

        public AdminService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AdminDashboardDto> GetDashboardAsync()
        {
            // Get Seller role
            var sellerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Seller");

            // Get Customer role
            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Customer");

            var totalSellers = 0;
            var totalCustomers = 0;

            // Count sellers
            if (sellerRole != null)
            {
                totalSellers = await _context.UserRoles
                    .CountAsync(x => x.RoleId == sellerRole.Id);
            }

            // Count customers
            if (customerRole != null)
            {
                totalCustomers = await _context.UserRoles
                    .CountAsync(x => x.RoleId == customerRole.Id);
            }

            // Create dashboard response
            return new AdminDashboardDto
            {
                // Total registered users
                TotalUsers = await _context.Users.CountAsync(),

                // Total sellers
                TotalSellers = totalSellers,

                // Total customers
                TotalCustomers = totalCustomers,

                // Total products
                TotalProducts = await _context.Products.CountAsync(),

                // Total categories
                TotalCategories = await _context.Categories.CountAsync(),

                // Total orders
                TotalOrders = await _context.Orders.CountAsync(),

                // Revenue from delivered orders
                TotalRevenue = await _context.Orders
                    .Where(x => x.Status == OrderStatus.Delivered)
                    .SumAsync(x => (decimal?)x.TotalAmount) ?? 0,

                // Pending orders
                PendingOrders = await _context.Orders
                    .CountAsync(x => x.Status == OrderStatus.Pending)
            };
        }

        public async Task<IEnumerable<object>> GetSellersAsync()
        {
            var sellerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Seller");

            if (sellerRole == null)
            {
                return new List<object>();
            }

            var sellerUserIds = await _context.UserRoles
                .Where(ur => ur.RoleId == sellerRole.Id)
                .Select(ur => ur.UserId)
                .ToListAsync();

            var sellers = await _context.Users
                .Where(u => sellerUserIds.Contains(u.Id))
                .Select(u => new
                {
                    id = u.Id,
                    name = u.FullName,
                    fullName = u.FullName,
                    email = u.Email,
                    phone = u.Phone,
                    address = u.Address,
                    isActive = u.IsActive,
                    createdAt = u.CreatedAt
                })
                .ToListAsync();

            return sellers;
        }

        public async Task<object?> GetSellerByIdAsync(int id)
        {
            var sellerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Seller");

            if (sellerRole == null)
            {
                return null;
            }

            var isSeller = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == id && ur.RoleId == sellerRole.Id);

            if (!isSeller)
            {
                return null;
            }

            var seller = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.FullName,
                    fullName = u.FullName,
                    email = u.Email,
                    phone = u.Phone,
                    address = u.Address,
                    isActive = u.IsActive,
                    createdAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            return seller;
        }

        public async Task<object> CreateSellerAsync(CreateSellerDto dto)
        {
            var sellerName = !string.IsNullOrWhiteSpace(dto.FullName) ? dto.FullName : dto.Name;
            if (string.IsNullOrWhiteSpace(sellerName))
            {
                throw new Exception("Seller name is required.");
            }

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (existingUser != null)
            {
                throw new Exception("Email already exists.");
            }

            var sellerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Seller");

            if (sellerRole == null)
            {
                throw new Exception("Seller role does not exist.");
            }

            var seller = new User
            {
                FullName = sellerName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                Address = dto.Address,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(seller);

            await _context.SaveChangesAsync();

            var userRole = new UserRole
            {
                UserId = seller.Id,
                RoleId = sellerRole.Id
            };

            _context.UserRoles.Add(userRole);

            await _context.SaveChangesAsync();

            return new
            {
                message = "Seller created successfully.",
                sellerId = seller.Id,
                name = seller.FullName,
                seller.FullName,
                seller.Email,
                role = "Seller"
            };
        }

        public async Task<object> UpdateSellerAsync(int id, UpdateSellerDto dto)
        {
            var sellerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Seller");

            if (sellerRole == null)
            {
                throw new Exception("Seller role does not exist.");
            }

            var isSeller = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == id && ur.RoleId == sellerRole.Id);

            if (!isSeller)
            {
                throw new Exception("Seller not found.");
            }

            var seller = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (seller == null)
            {
                throw new Exception("Seller not found.");
            }

            var newName = !string.IsNullOrWhiteSpace(dto.FullName) ? dto.FullName : dto.Name;
            if (!string.IsNullOrWhiteSpace(newName))
            {
                seller.FullName = newName;
            }

            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != seller.Email)
            {
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != id);

                if (existingUser != null)
                {
                    throw new Exception("Email is already in use by another user.");
                }

                seller.Email = dto.Email;
            }

            if (dto.Phone != null) seller.Phone = dto.Phone;
            if (dto.Address != null) seller.Address = dto.Address;
            if (dto.IsActive.HasValue) seller.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();

            return new
            {
                message = "Seller updated successfully.",
                id = seller.Id,
                name = seller.FullName,
                fullName = seller.FullName,
                seller.Email
            };
        }

        public async Task<object> DeleteSellerAsync(int id)
        {
            var sellerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Seller");

            if (sellerRole == null)
            {
                throw new Exception("Seller role does not exist.");
            }

            var isSeller = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == id && ur.RoleId == sellerRole.Id);

            if (!isSeller)
            {
                throw new Exception("Seller not found.");
            }

            var seller = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (seller == null)
            {
                throw new Exception("Seller not found.");
            }

            var hasProducts = await _context.Products.AnyAsync(p => p.SellerId == id);
            if (hasProducts)
            {
                seller.IsActive = false;
                await _context.SaveChangesAsync();
                return new { message = "Seller deactivated successfully due to existing product associations." };
            }

            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == id)
                .ToListAsync();

            _context.UserRoles.RemoveRange(userRoles);
            _context.Users.Remove(seller);

            await _context.SaveChangesAsync();

            return new { message = "Seller deleted successfully." };
        }

        public async Task<IEnumerable<object>> GetCustomersAsync()
        {
            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Customer");

            if (customerRole == null)
            {
                return new List<object>();
            }

            var customerUserIds = await _context.UserRoles
                .Where(ur => ur.RoleId == customerRole.Id)
                .Select(ur => ur.UserId)
                .ToListAsync();

            return await _context.Users
                .Where(u => customerUserIds.Contains(u.Id))
                .Select(u => new
                {
                    id = u.Id,
                    name = u.FullName,
                    fullName = u.FullName,
                    email = u.Email,
                    phone = u.Phone,
                    address = u.Address,
                    isActive = u.IsActive,
                    createdAt = u.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<object?> GetCustomerByIdAsync(int id)
        {
            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Customer");

            if (customerRole == null)
            {
                return null;
            }

            var isCustomer = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == id && ur.RoleId == customerRole.Id);

            if (!isCustomer)
            {
                return null;
            }

            return await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.FullName,
                    fullName = u.FullName,
                    email = u.Email,
                    phone = u.Phone,
                    address = u.Address,
                    isActive = u.IsActive,
                    createdAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<object> CreateCustomerAsync(CreateCustomerDto dto)
        {
            var customerName = !string.IsNullOrWhiteSpace(dto.FullName) ? dto.FullName : dto.Name;
            if (string.IsNullOrWhiteSpace(customerName))
            {
                throw new Exception("Customer name is required.");
            }

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(x => x.Email == dto.Email);

            if (existingUser != null)
            {
                throw new Exception("Email already exists.");
            }

            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Customer");

            if (customerRole == null)
            {
                throw new Exception("Customer role does not exist.");
            }

            var customer = new User
            {
                FullName = customerName,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Phone = dto.Phone,
                Address = dto.Address,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(customer);

            await _context.SaveChangesAsync();

            var userRole = new UserRole
            {
                UserId = customer.Id,
                RoleId = customerRole.Id
            };

            _context.UserRoles.Add(userRole);

            await _context.SaveChangesAsync();

            return new
            {
                message = "Customer created successfully.",
                customerId = customer.Id,
                name = customer.FullName,
                customer.FullName,
                customer.Email,
                role = "Customer"
            };
        }

        public async Task<object> UpdateCustomerAsync(int id, UpdateCustomerDto dto)
        {
            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Customer");

            if (customerRole == null)
            {
                throw new Exception("Customer role does not exist.");
            }

            var isCustomer = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == id && ur.RoleId == customerRole.Id);

            if (!isCustomer)
            {
                throw new Exception("Customer not found.");
            }

            var customer = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (customer == null)
            {
                throw new Exception("Customer not found.");
            }

            var newName = !string.IsNullOrWhiteSpace(dto.FullName) ? dto.FullName : dto.Name;
            if (!string.IsNullOrWhiteSpace(newName))
            {
                customer.FullName = newName;
            }

            if (!string.IsNullOrWhiteSpace(dto.Email) && dto.Email != customer.Email)
            {
                var existingUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != id);

                if (existingUser != null)
                {
                    throw new Exception("Email is already in use by another user.");
                }

                customer.Email = dto.Email;
            }

            if (dto.Phone != null) customer.Phone = dto.Phone;
            if (dto.Address != null) customer.Address = dto.Address;
            if (dto.IsActive.HasValue) customer.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();

            return new
            {
                message = "Customer updated successfully.",
                id = customer.Id,
                name = customer.FullName,
                fullName = customer.FullName,
                customer.Email
            };
        }

        public async Task<object> DeleteCustomerAsync(int id)
        {
            var customerRole = await _context.Roles
                .FirstOrDefaultAsync(x => x.Name == "Customer");

            if (customerRole == null)
            {
                throw new Exception("Customer role does not exist.");
            }

            var isCustomer = await _context.UserRoles
                .AnyAsync(ur => ur.UserId == id && ur.RoleId == customerRole.Id);

            if (!isCustomer)
            {
                throw new Exception("Customer not found.");
            }

            var customer = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (customer == null)
            {
                throw new Exception("Customer not found.");
            }

            var hasOrders = await _context.Orders.AnyAsync(o => o.CustomerId == id);
            if (hasOrders)
            {
                customer.IsActive = false;
                await _context.SaveChangesAsync();
                return new { message = "Customer deactivated successfully due to existing order history." };
            }

            var userRoles = await _context.UserRoles
                .Where(ur => ur.UserId == id)
                .ToListAsync();

            _context.UserRoles.RemoveRange(userRoles);
            _context.Users.Remove(customer);

            await _context.SaveChangesAsync();

            return new { message = "Customer deleted successfully." };
        }
    }
}
