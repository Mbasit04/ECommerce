using ECommerce.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }


        // =========================
        // USER & ROLE
        // =========================

        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<UserRole> UserRoles => Set<UserRole>();
        public DbSet<RolePermission> RolePermissions => Set<RolePermission>();


        // =========================
        // PRODUCT
        // =========================

        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Product> Products => Set<Product>();


        // =========================
        // CART
        // =========================

        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();


        // =========================
        // ORDER
        // =========================

        public DbSet<Order> Orders => Set<Order>();
        public DbSet<OrderItem> OrderItems => Set<OrderItem>();


        // =========================
        // PAYMENT
        // =========================

        public DbSet<Transaction> Transactions => Set<Transaction>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<PaymentMethod> PaymentMethods => Set<PaymentMethod>();


        // =========================
        // SHIPPING
        // =========================

        public DbSet<Shipping> Shippings => Set<Shipping>();


        // =========================
        // OTHER
        // =========================

        public DbSet<Deal> Deals => Set<Deal>();
        public DbSet<Refund> Refunds => Set<Refund>();
        public DbSet<Feedback> Feedbacks => Set<Feedback>();
        public DbSet<Message> Messages => Set<Message>();
        public DbSet<StockMovement> StockMovements => Set<StockMovement>();
        public DbSet<Conversation> Conversations => Set<Conversation>();
        public DbSet<Message> Message => Set<Message>();

        protected override void OnModelCreating(
            ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RolePermission>()
                .HasIndex(x => new { x.RoleId, x.ModuleKey })
                .IsUnique();


            // =========================================================
            // USER ROLE
            // =========================================================

            modelBuilder.Entity<UserRole>()
                .HasKey(x => new
                {
                    x.UserId,
                    x.RoleId
                });

            modelBuilder.Entity<UserRole>()
                .HasOne(x => x.User)
                .WithMany(x => x.UserRoles)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserRole>()
                .HasOne(x => x.Role)
                .WithMany(x => x.UserRoles)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Cascade);


            // =========================================================
            // PRODUCT -> SELLER
            // =========================================================

            modelBuilder.Entity<Product>()
                .HasOne(x => x.Seller)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.SellerId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // PRODUCT -> CATEGORY
            // =========================================================

            modelBuilder.Entity<Product>()
                .HasOne(x => x.Category)
                .WithMany(x => x.Products)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // CART -> CUSTOMER
            // =========================================================

            modelBuilder.Entity<Cart>()
                .HasOne(x => x.Customer)
                .WithMany()
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // CART ITEM -> CART
            // =========================================================

            modelBuilder.Entity<CartItem>()
                .HasOne(x => x.Cart)
                .WithMany(x => x.CartItems)
                .HasForeignKey(x => x.CartId)
                .OnDelete(DeleteBehavior.Cascade);


            // =========================================================
            // CART ITEM -> PRODUCT
            // =========================================================

            modelBuilder.Entity<CartItem>()
                .HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // ORDER -> CUSTOMER
            // =========================================================

            modelBuilder.Entity<Order>()
                .HasOne(x => x.Customer)
                .WithMany(x => x.Orders)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // ORDER ITEM -> ORDER
            // =========================================================

            modelBuilder.Entity<OrderItem>()
                .HasOne(x => x.Order)
                .WithMany(x => x.OrderItems)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);


            // =========================================================
            // ORDER ITEM -> PRODUCT
            // =========================================================

            modelBuilder.Entity<OrderItem>()
                .HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // ORDER -> PAYMENT
            // One Order has one Payment
            // =========================================================

            modelBuilder.Entity<Payment>()
                .HasOne(x => x.Order)
                .WithOne(x => x.Payment)
                .HasForeignKey<Payment>(x => x.OrderId)
                .OnDelete(DeleteBehavior.NoAction);


            // =========================================================
            // ORDER -> SHIPPING
            // One Order has one Shipping
            // =========================================================

            modelBuilder.Entity<Shipping>()
                .HasOne(x => x.Order)
                .WithOne(x => x.Shipping)
                .HasForeignKey<Shipping>(x => x.OrderId)
                .OnDelete(DeleteBehavior.NoAction);


            // =========================================================
            // ORDER -> TRANSACTION
            // One Order has one Transaction
            // =========================================================

            modelBuilder.Entity<Transaction>()
                .HasOne(x => x.Order)
                .WithOne(x => x.Transaction)
                .HasForeignKey<Transaction>(x => x.OrderId)
                .OnDelete(DeleteBehavior.NoAction);


            // =========================================================
            // TRANSACTION -> PAYMENT METHOD
            // =========================================================

            modelBuilder.Entity<Transaction>()
                .HasOne(x => x.PaymentMethod)
                .WithMany()
                .HasForeignKey(x => x.PaymentMethodId)
                .OnDelete(DeleteBehavior.NoAction);


            // =========================================================
            // ORDER -> PAYMENT METHOD
            // =========================================================

            modelBuilder.Entity<Order>()
                .HasOne(x => x.PaymentMethod)
                .WithMany()
                .HasForeignKey(x => x.PaymentMethodId)
                .OnDelete(DeleteBehavior.NoAction);


            // =========================================================
            // PRODUCT -> DEAL
            // =========================================================

            modelBuilder.Entity<Deal>()
                .HasOne(x => x.Product)
                .WithMany(x => x.Deals)
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Deal>()
                .HasOne(x => x.Seller)
                .WithMany()
                .HasForeignKey(x => x.SellerId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // PRODUCT -> STOCK MOVEMENT
            // =========================================================

            modelBuilder.Entity<StockMovement>()
                .HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // USER -> STOCK MOVEMENT
            // =========================================================

            modelBuilder.Entity<StockMovement>()
                .HasOne(x => x.Seller)
                .WithMany()
                .HasForeignKey(x => x.SellerId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================================================
            // PRODUCT PRICE
            // =========================================================

            modelBuilder.Entity<Product>()
                .Property(x => x.Price)
                .HasPrecision(18, 2);

            modelBuilder.Entity<CartItem>()
                .Property(x => x.Price)
                .HasPrecision(18, 2);


            // =========================================================
            // DEAL DISCOUNT
            // =========================================================

            modelBuilder.Entity<Deal>()
                .Property(x => x.DiscountPercentage)
                .HasPrecision(5, 2);


            // =========================================================
            // ORDER MONEY FIELDS
            // =========================================================

            modelBuilder.Entity<Order>()
                .Property(x => x.SubTotal)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(x => x.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(x => x.ShippingAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Order>()
                .Property(x => x.TotalAmount)
                .HasPrecision(18, 2);

            // OrderStatus is a value object. Persist its enum value in the
            // existing integer Status column instead of treating it as an entity.
            modelBuilder.Entity<Order>()
                .Property(x => x.Status)
                .HasConversion(
                    status => (int)status,
                    value => new OrderStatus(value));


            // =========================================================
            // ORDER ITEM MONEY FIELDS
            // =========================================================

            modelBuilder.Entity<OrderItem>()
                .Property(x => x.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(x => x.DiscountAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<OrderItem>()
                .Property(x => x.TotalPrice)
                .HasPrecision(18, 2);


            // =========================================================
            // PAYMENT
            // =========================================================

            modelBuilder.Entity<Payment>()
                .Property(x => x.Amount)
                .HasPrecision(18, 2);


            // =========================================================
            // TRANSACTION
            // =========================================================

            modelBuilder.Entity<Transaction>()
                .Property(x => x.Amount)
                .HasPrecision(18, 2);


            // =========================================================
            // REFUND
            // =========================================================

            modelBuilder.Entity<Refund>()
                .Property(x => x.Amount)
                .HasPrecision(18, 2);
            modelBuilder.Entity<Refund>()
                .HasOne(x => x.Order)
                .WithMany()
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Refund>()
               .HasOne(x => x.Customer)
               .WithMany()
               .HasForeignKey(x => x.CustomerId)
               .OnDelete(DeleteBehavior.Restrict);

            // =========================================================
            // ROLE SEED DATA
            // =========================================================

            modelBuilder.Entity<Role>().HasData(
                new Role
                {
                    Id = 1,
                    Name = "Admin"
                },

                new Role
                {
                    Id = 2,
                    Name = "Seller"
                },

                new Role
                {
                    Id = 3,
                    Name = "Customer"
                }
            );

            // =========================================================
            // ROLE PERMISSION SEED — defaults mirror the matrix that
            // was previously hard-coded in AdminRolePermissions.jsx.
            // Admins can override any cell at runtime via
            // PUT /api/Admin/permissions/{roleId}/{moduleKey}.
            // =========================================================

            var modules = new[]
            {
                "dashboard",
                "manage_sellers",
                "manage_customers",
                "categories_products",
                "stocks_deals",
                "orders_shipping",
                "refunds",
                "reviews",
                "messages",
                "role_permissions"
            };

            // Default capability matrix — keys: (module, roleId).
            // Values come from the previous built-in matrix:
            //   true   → "allow"
            //   false  → "deny"
            //   "own"  → "own"
            //   "read" → "read"
            //   "write"→ "write"
            var defaultCapabilities = new Dictionary<(string module, int roleId), string>
            {
                [("dashboard", 1)] = "allow",
                [("dashboard", 2)] = "allow",
                [("dashboard", 3)] = "allow",

                [("manage_sellers", 1)] = "allow",
                [("manage_sellers", 2)] = "deny",
                [("manage_sellers", 3)] = "deny",

                [("manage_customers", 1)] = "allow",
                [("manage_customers", 2)] = "deny",
                [("manage_customers", 3)] = "deny",

                [("categories_products", 1)] = "allow",
                [("categories_products", 2)] = "own",
                [("categories_products", 3)] = "deny",

                [("stocks_deals", 1)] = "allow",
                [("stocks_deals", 2)] = "allow",
                [("stocks_deals", 3)] = "deny",

                [("orders_shipping", 1)] = "allow",
                [("orders_shipping", 2)] = "own",
                [("orders_shipping", 3)] = "own",

                [("refunds", 1)] = "allow",
                [("refunds", 2)] = "deny",
                [("refunds", 3)] = "allow",

                [("reviews", 1)] = "allow",
                [("reviews", 2)] = "read",
                [("reviews", 3)] = "write",

                [("messages", 1)] = "deny",
                [("messages", 2)] = "allow",
                [("messages", 3)] = "allow",

                [("role_permissions", 1)] = "allow",
                [("role_permissions", 2)] = "deny",
                [("role_permissions", 3)] = "deny",
            };

            var permissionSeed = new List<RolePermission>();
            var seedId = 1;

            foreach (var module in modules)
            {
                foreach (var roleId in new[] { 1, 2, 3 })
                {
                    permissionSeed.Add(new RolePermission
                    {
                        Id = seedId++,
                        RoleId = roleId,
                        ModuleKey = module,
                        Capability =
                            defaultCapabilities[(module, roleId)],
                        UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0,
                            DateTimeKind.Utc),
                    });
                }
            }

            modelBuilder.Entity<RolePermission>().HasData(permissionSeed);
            // =========================================================
            // feedback -> product
            // =========================================================
            modelBuilder.Entity<Feedback>()
                 .HasOne(x => x.Product)
                 .WithMany()
                 .HasForeignKey(x => x.ProductId)
                 .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Feedback>()
              .HasOne(x => x.Customer)
              .WithMany()
              .HasForeignKey(x => x.CustomerId)
              .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Feedback>()
               .HasOne(x => x.Order)
               .WithMany()
               .HasForeignKey(x => x.OrderId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Feedback>()
                .ToTable(x =>
                x.HasCheckConstraint(
                    "CK_Feedback_Rating",
                    "[Rating] >= 1 AND [Rating] <= 5"));

            modelBuilder.Entity<Feedback>()
                .HasIndex(x => new
            {
                   x.CustomerId,
                   x.ProductId,
                   x.OrderId
                   })
                  .IsUnique();
            // Conversation -> Customer
            modelBuilder.Entity<Conversation>()
                .HasOne(x => x.Customer)
                .WithMany()
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Conversation -> Seller
            modelBuilder.Entity<Conversation>()
                .HasOne(x => x.Seller)
                .WithMany()
                .HasForeignKey(x => x.SellerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Conversation -> Product
            modelBuilder.Entity<Conversation>()
                .HasOne(x => x.Product)
                .WithMany()
                .HasForeignKey(x => x.ProductId)
                .OnDelete(DeleteBehavior.Restrict);


            // Message -> Conversation
            modelBuilder.Entity<Message>()
                .HasOne(x => x.Conversation)
                .WithMany(x => x.Messages)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Message -> Sender
            modelBuilder.Entity<Message>()
                .HasOne(x => x.Sender)
                .WithMany()
                .HasForeignKey(x => x.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            // Message -> Receiver
            modelBuilder.Entity<Message>()
                .HasOne(x => x.Receiver)
                .WithMany()
                .HasForeignKey(x => x.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
