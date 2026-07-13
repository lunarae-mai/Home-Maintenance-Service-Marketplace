using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeServicesPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBookingAddressAndPhone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactPhoneNumber",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ServiceDeliveryAddress",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactPhoneNumber",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ServiceDeliveryAddress",
                table: "Bookings");
        }
    }
}
