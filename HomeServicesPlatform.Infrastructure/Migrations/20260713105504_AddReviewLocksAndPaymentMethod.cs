using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeServicesPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewLocksAndPaymentMethod : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "HasCustomerReviewed",
                table: "Bookings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "HasProviderReviewed",
                table: "Bookings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HasCustomerReviewed",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "HasProviderReviewed",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Bookings");
        }
    }
}
