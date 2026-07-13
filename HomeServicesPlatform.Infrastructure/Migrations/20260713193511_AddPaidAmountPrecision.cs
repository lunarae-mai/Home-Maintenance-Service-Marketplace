using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeServicesPlatform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPaidAmountPrecision : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ProviderProfileId",
                table: "Bookings",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_ProviderProfileId",
                table: "Bookings",
                column: "ProviderProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_ProviderProfiles_ProviderProfileId",
                table: "Bookings",
                column: "ProviderProfileId",
                principalTable: "ProviderProfiles",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_ProviderProfiles_ProviderProfileId",
                table: "Bookings");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_ProviderProfileId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "ProviderProfileId",
                table: "Bookings");
        }
    }
}
