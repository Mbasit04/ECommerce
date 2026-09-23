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


        // =========================================================
        // SHIPPING MONITORING — STEP 20.6
        // =========================================================

        // GET ALL SHIPPING RECORDS (Admin overview)
        public async Task<List<AdminShippingDto>>
            GetAllShippingAsync()
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.Customer)
                .Include(o => o.Shipping)
                .OrderByDescending(o => o.Id)
                .Select(o => new AdminShippingDto
                {
                    OrderId = o.Id,

                    CustomerName =
                        o.Customer.FullName,

                    ShippingAddress =
                        o.ShippingAddress ?? string.Empty,

                    City =
                        o.City ?? string.Empty,

                    PhoneNumber =
                        o.PhoneNumber ?? string.Empty,

                    TrackingNumber =
                        o.Shipping != null
                            ? o.Shipping.TrackingNumber
                            : null,

                    OrderStatus =
                        o.Status.ToString(),

                    ShippedAt =
                        o.Shipping != null
                            ? o.Shipping.ShippedAt
                            : null,

                    DeliveredAt =
                        o.Shipping != null
                            ? o.Shipping.DeliveredAt
                            : null
                })
                .ToListAsync();
        }

        // GET SHIPPING FOR ONE ORDER
        public async Task<AdminShippingDto?>
            GetShippingByOrderIdAsync(
                int orderId)
        {
            return await _context.Orders
                .AsNoTracking()
                .Include(o => o.Customer)
                .Include(o => o.Shipping)
                .Where(o => o.Id == orderId)
                .Select(o => new AdminShippingDto
                {
                    OrderId = o.Id,

                    CustomerName =
                        o.Customer.FullName,

                    ShippingAddress =
                        o.ShippingAddress ?? string.Empty,

                    City =
                        o.City ?? string.Empty,

                    PhoneNumber =
                        o.PhoneNumber ?? string.Empty,

                    TrackingNumber =
                        o.Shipping != null
                            ? o.Shipping.TrackingNumber
                            : null,

                    OrderStatus =
                        o.Status.ToString(),

                    ShippedAt =
                        o.Shipping != null
                            ? o.Shipping.ShippedAt
                            : null,

                    DeliveredAt =
                        o.Shipping != null
                            ? o.Shipping.DeliveredAt
                            : null
                })
                .FirstOrDefaultAsync();
        }


        // =========================================================
        // REFUND MANAGEMENT — PHASE 22
        // =========================================================

        public async Task<List<AdminRefundDto>>
            GetAllRefundsAsync()
        {
            return await _context.Refunds
                .AsNoTracking()
                .Include(r => r.Customer)
                .OrderByDescending(r => r.RequestedAt)
                .Select(r => new AdminRefundDto
                {
                    RefundId = r.Id,

                    OrderId = r.OrderId,

                    CustomerId = r.CustomerId,

                    CustomerName =
                        r.Customer.FullName,

                    CustomerEmail =
                        r.Customer.Email,

                    Amount = r.Amount,

                    Reason = r.Reason,

                    Status = r.Status,

                    PaymentMethod = r.PaymentMethod,

                    StripeRefundId = r.StripeRefundId,

                    RequestedAt = r.RequestedAt,

                    ProcessedAt = r.ProcessedAt
                })
                .ToListAsync();
        }

        public async Task<AdminRefundDto?>
            GetRefundByIdAsync(int refundId)
        {
            return await _context.Refunds
                .AsNoTracking()
                .Include(r => r.Customer)
                .Where(r => r.Id == refundId)
                .Select(r => new AdminRefundDto
                {
                    RefundId = r.Id,

                    OrderId = r.OrderId,

                    CustomerId = r.CustomerId,

                    CustomerName =
                        r.Customer.FullName,

                    CustomerEmail =
                        r.Customer.Email,

                    Amount = r.Amount,

                    Reason = r.Reason,

                    Status = r.Status,

                    PaymentMethod = r.PaymentMethod,

                    StripeRefundId = r.StripeRefundId,

                    RequestedAt = r.RequestedAt,

                    ProcessedAt = r.ProcessedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> ApproveRefundAsync(
            int refundId)
        {
            var refund = await _context.Refunds
                .FirstOrDefaultAsync(r =>
                    r.Id == refundId);

            if (refund == null)
            {
                return false;
            }

            if (!string.Equals(
                refund.Status,
                "Requested",
                StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(
                    refund.Status,
                    "Pending",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception(
                    "Refund cannot be approved in its current state.");
            }

            refund.Status = "Approved";
            refund.ProcessedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RejectRefundAsync(
            int refundId)
        {
            var refund = await _context.Refunds
                .FirstOrDefaultAsync(r =>
                    r.Id == refundId);

            if (refund == null)
            {
                return false;
            }

            if (!string.Equals(
                refund.Status,
                "Requested",
                StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(
                    refund.Status,
                    "Pending",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new Exception(
                    "Refund cannot be rejected in its current state.");
            }

            refund.Status = "Rejected";
            refund.ProcessedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return true;
        }


        // =========================================================
        // PHASE 23 — ADMIN REVIEW MANAGEMENT
        // =========================================================

        // Admin-level override: list every review across all sellers/customer,
        // newest first. Used by the Admin Reviews moderation table.
        public async Task<List<AdminReviewDto>>
            GetAllReviewsAsync()
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => new AdminReviewDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product.Name,
                    CustomerId = x.CustomerId,
                    CustomerName = x.Customer.FullName,
                    Rating = x.Rating,
                    Comment = x.Comment,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<AdminReviewDto?>
            GetReviewByIdAsync(
                int reviewId)
        {
            return await _context.Feedbacks
                .AsNoTracking()
                .Where(x => x.Id == reviewId)
                .Select(x => new AdminReviewDto
                {
                    Id = x.Id,
                    ProductId = x.ProductId,
                    ProductName = x.Product.Name,
                    CustomerId = x.CustomerId,
                    CustomerName = x.Customer.FullName,
                    Rating = x.Rating,
                    Comment = x.Comment,
                    CreatedAt = x.CreatedAt,
                    UpdatedAt = x.UpdatedAt
                })
                .FirstOrDefaultAsync();
        }

        // Hard-delete the review — admin moderation path. No ownership checks
        // because admins are allowed to remove any review on the platform.
        public async Task<bool>
            DeleteReviewAsync(
                int reviewId)
        {
            var review = await _context.Feedbacks
                .FirstOrDefaultAsync(x => x.Id == reviewId);

            if (review == null)
            {
                throw new Exception("Review not found.");
            }

            _context.Feedbacks.Remove(review);
            await _context.SaveChangesAsync();
            return true;
        }


        // =========================================================
        // PHASE 26 — ROLE PERMISSIONS CONSOLE
        // =========================================================

        // Hard-coded descriptions for the seeded roles. Keeping these in the
        // backend (rather than the DB) avoids a schema change and keeps the
        // permission vocabulary stable.
        private static string DescribeRole(string name) => name switch
        {
            "Admin"    => "Full platform access — manages sellers, customers, products, orders, refunds and reviews.",
            "Seller"   => "Manages their own products, stock, deals, shipping, reviews and customer messages.",
            "Customer" => "Browses products, places orders, writes reviews and contacts sellers.",
            _          => "Custom role.",
        };

        public async Task<List<RoleSummaryDto>> GetRolesAsync()
        {
            // Pull every role with the count of users holding it. Done in a
            // single query (GroupJoin) so we don't N+1 over UserRoles.
            var roles = await _context.Roles
                .AsNoTracking()
                .OrderBy(x => x.Name)
                .Select(role => new RoleSummaryDto
                {
                    Id = role.Id,
                    Name = role.Name,
                    Description = DescribeRole(role.Name),
                    UserCount = role.UserRoles.Count
                })
                .ToListAsync();

            return roles;
        }

        public async Task<List<RoleUserDto>> GetUsersInRoleAsync(int roleId)
        {
            return await _context.UserRoles
                .AsNoTracking()
                .Where(ur => ur.RoleId == roleId)
                .Include(ur => ur.User)
                .OrderBy(ur => ur.User.FullName)
                .Select(ur => new RoleUserDto
                {
                    UserId = ur.UserId,
                    FullName = ur.User.FullName,
                    Email = ur.User.Email,
                    IsActive = ur.User.IsActive,
                    CreatedAt = ur.User.CreatedAt
                })
                .ToListAsync();
        }

        // Returns every user with their current role so the admin table can
        // show a single combined view (rather than picking one role).
        public async Task<List<RoleUserDto>> GetAllUsersWithRolesAsync()
        {
            // Use the latest UserRole assignment per user when a user has more
            // than one (defensive — the schema is a join table, so a user
            // could in theory be linked to multiple roles).
            var userRoles = await _context.UserRoles
                .AsNoTracking()
                .Include(ur => ur.User)
                .ToListAsync();

            return userRoles
                .GroupBy(ur => ur.UserId)
                .Select(group =>
                {
                    var first = group.OrderBy(ur => ur.RoleId).First();
                    return new RoleUserDto
                    {
                        UserId = first.UserId,
                        FullName = first.User.FullName,
                        Email = first.User.Email,
                        IsActive = first.User.IsActive,
                        CreatedAt = first.User.CreatedAt
                    };
                })
                .OrderBy(x => x.FullName)
                .ToList();
        }

        public async Task<bool> UpdateUserRoleAsync(
                int adminUserId,
                int targetUserId,
                int newRoleId)
        {
            if (targetUserId <= 0)
            {
                throw new Exception("Invalid user.");
            }

            if (newRoleId <= 0)
            {
                throw new Exception("Invalid role.");
            }

            // Don't let admins demote themselves — it would lock them out
            // of the console the next time they try to log in.
            if (targetUserId == adminUserId)
            {
                var selfRole = await _context.UserRoles
                    .AsNoTracking()
                    .FirstOrDefaultAsync(ur =>
                        ur.UserId == adminUserId &&
                        ur.RoleId == newRoleId);

                if (selfRole == null)
                {
                    throw new Exception(
                        "You cannot change your own role from the admin console.");
                }
            }

            var newRoleExists = await _context.Roles
                .AnyAsync(r => r.Id == newRoleId);

            if (!newRoleExists)
            {
                throw new Exception("Selected role does not exist.");
            }

            var existingRoles = await _context.UserRoles
                .Where(ur => ur.UserId == targetUserId)
                .ToListAsync();

            if (existingRoles.Count == 0)
            {
                _context.UserRoles.Add(new UserRole
                {
                    UserId = targetUserId,
                    RoleId = newRoleId
                });
            }
            else
            {
                // Replace existing assignments with the new role so the user
                // doesn't end up holding both old + new at the same time.
                _context.UserRoles.RemoveRange(existingRoles);

                _context.UserRoles.Add(new UserRole
                {
                    UserId = targetUserId,
                    RoleId = newRoleId
                });
            }

            await _context.SaveChangesAsync();
            return true;
        }


        // =========================================================
        // PHASE 26 — ROLE PERMISSION MATRIX (admin editable)
        // =========================================================

        // The allow-list — anything outside this is rejected so the DB
        // stays consistent regardless of what the UI sends.
        private static readonly HashSet<string> AllowedCapabilities =
            new(StringComparer.OrdinalIgnoreCase)
            {
                "allow", "deny", "own", "read", "write"
            };

        public async Task<List<RolePermissionDto>>
            GetAllPermissionsAsync()
        {
            return await _context.RolePermissions
                .AsNoTracking()
                .Include(x => x.Role)
                .OrderBy(x => x.RoleId)
                .ThenBy(x => x.ModuleKey)
                .Select(x => new RolePermissionDto
                {
                    Id = x.Id,
                    RoleId = x.RoleId,
                    RoleName = x.Role != null
                        ? x.Role.Name
                        : string.Empty,
                    ModuleKey = x.ModuleKey,
                    Capability = x.Capability,
                    UpdatedAt = x.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<RolePermissionDto?>
            UpdatePermissionAsync(
                int roleId,
                string moduleKey,
                string capability)
        {
            if (string.IsNullOrWhiteSpace(moduleKey))
            {
                throw new Exception("Module key is required.");
            }

            if (!AllowedCapabilities.Contains(capability))
            {
                throw new Exception(
                    "Capability must be one of: allow, deny, own, read, write.");
            }

            var roleExists = await _context.Roles
                .AnyAsync(r => r.Id == roleId);

            if (!roleExists)
            {
                throw new Exception("Role not found.");
            }

            var entry = await _context.RolePermissions
                .Include(x => x.Role)
                .FirstOrDefaultAsync(x =>
                    x.RoleId == roleId &&
                    x.ModuleKey == moduleKey);

            if (entry == null)
            {
                // Lazy-create on first edit so admins can add a brand-new
                // module/role combination without a migration.
                entry = new RolePermission
                {
                    RoleId = roleId,
                    ModuleKey = moduleKey.ToLowerInvariant(),
                    Capability = capability.ToLowerInvariant()
                };

                _context.RolePermissions.Add(entry);
            }
            else
            {
                entry.Capability = capability.ToLowerInvariant();
                entry.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            return new RolePermissionDto
            {
                Id = entry.Id,
                RoleId = entry.RoleId,
                RoleName = entry.Role?.Name ?? string.Empty,
                ModuleKey = entry.ModuleKey,
                Capability = entry.Capability,
                UpdatedAt = entry.UpdatedAt
            };
        }
    }
}
