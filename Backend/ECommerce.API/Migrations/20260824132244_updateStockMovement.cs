using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ECommerce.API.Migrations
{
    /// <inheritdoc />
    public partial class updateStockMovement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Users_UserId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_PaymentMethods_PaymentMethodId",
                table: "Transactions");

            migrationBuilder.AlterColumn<string>(
                name: "Reason",
                table: "StockMovements",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NewQuantity",
                table: "StockMovements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PreviousQuantity",
                table: "StockMovements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "QuantityChanged",
                table: "StockMovements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "SellerId",
                table: "StockMovements",
                type: "int",
                nullable: false,
                defaultValue: 0);

            // Populate SellerId from Product table
            migrationBuilder.Sql(
                @"UPDATE sm
                  SET sm.SellerId = p.SellerId
                  FROM StockMovements sm
                  INNER JOIN Products p ON sm.ProductId = p.Id");

            migrationBuilder.CreateIndex(
                name: "IX_StockMovements_SellerId",
                table: "StockMovements",
                column: "SellerId");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Users_SellerId",
                table: "StockMovements",
                column: "SellerId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Users_UserId",
                table: "StockMovements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_PaymentMethods_PaymentMethodId",
                table: "Transactions",
                column: "PaymentMethodId",
                principalTable: "PaymentMethods",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Users_SellerId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_StockMovements_Users_UserId",
                table: "StockMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_Transactions_PaymentMethods_PaymentMethodId",
                table: "Transactions");

            migrationBuilder.DropIndex(
                name: "IX_StockMovements_SellerId",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "NewQuantity",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "PreviousQuantity",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "QuantityChanged",
                table: "StockMovements");

            migrationBuilder.DropColumn(
                name: "SellerId",
                table: "StockMovements");

            migrationBuilder.AlterColumn<string>(
                name: "Reason",
                table: "StockMovements",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddForeignKey(
                name: "FK_StockMovements_Users_UserId",
                table: "StockMovements",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Transactions_PaymentMethods_PaymentMethodId",
                table: "Transactions",
                column: "PaymentMethodId",
                principalTable: "PaymentMethods",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
