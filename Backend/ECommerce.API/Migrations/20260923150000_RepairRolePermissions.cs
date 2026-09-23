using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using ECommerce.API.Data;

#nullable disable

namespace ECommerce.API.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20260923150000_RepairRolePermissions")]
    public partial class RepairRolePermissions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'[RolePermissions]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [RolePermissions](
                        [Id] int IDENTITY(1,1) NOT NULL,
                        [RoleId] int NOT NULL,
                        [ModuleKey] nvarchar(64) NOT NULL,
                        [Capability] nvarchar(16) NOT NULL,
                        [UpdatedAt] datetime2 NOT NULL,
                        CONSTRAINT [PK_RolePermissions] PRIMARY KEY ([Id]),
                        CONSTRAINT [FK_RolePermissions_Roles_RoleId]
                            FOREIGN KEY ([RoleId]) REFERENCES [Roles]([Id]) ON DELETE CASCADE
                    );
                    CREATE UNIQUE INDEX [IX_RolePermissions_RoleId_ModuleKey]
                        ON [RolePermissions] ([RoleId], [ModuleKey]);
                END;

                INSERT INTO [RolePermissions] ([RoleId], [ModuleKey], [Capability], [UpdatedAt])
                SELECT defaults.[RoleId], defaults.[ModuleKey], defaults.[Capability], '2026-01-01T00:00:00'
                FROM (VALUES
                    (1, N'dashboard', N'allow'), (2, N'dashboard', N'allow'), (3, N'dashboard', N'allow'),
                    (1, N'manage_sellers', N'allow'), (2, N'manage_sellers', N'deny'), (3, N'manage_sellers', N'deny'),
                    (1, N'manage_customers', N'allow'), (2, N'manage_customers', N'deny'), (3, N'manage_customers', N'deny'),
                    (1, N'categories_products', N'allow'), (2, N'categories_products', N'allow'), (3, N'categories_products', N'deny'),
                    (1, N'stocks_deals', N'allow'), (2, N'stocks_deals', N'allow'), (3, N'stocks_deals', N'deny'),
                    (1, N'orders_shipping', N'allow'), (2, N'orders_shipping', N'allow'), (3, N'orders_shipping', N'allow'),
                    (1, N'refunds', N'allow'), (2, N'refunds', N'deny'), (3, N'refunds', N'allow'),
                    (1, N'reviews', N'allow'), (2, N'reviews', N'allow'), (3, N'reviews', N'allow'),
                    (1, N'messages', N'deny'), (2, N'messages', N'allow'), (3, N'messages', N'allow'),
                    (1, N'role_permissions', N'allow'), (2, N'role_permissions', N'deny'), (3, N'role_permissions', N'deny')
                ) AS defaults([RoleId], [ModuleKey], [Capability])
                WHERE EXISTS (SELECT 1 FROM [Roles] r WHERE r.[Id] = defaults.[RoleId])
                  AND NOT EXISTS (
                    SELECT 1 FROM [RolePermissions] p
                    WHERE p.[RoleId] = defaults.[RoleId]
                      AND p.[ModuleKey] = defaults.[ModuleKey]
                  );
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Keep role permission data when rolling back this repair migration.
        }
    }
}
