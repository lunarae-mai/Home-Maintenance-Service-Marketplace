//concurrency / slot engine / s3

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HomeServicesPlatform.Infrastructure.Migrations
{
    public partial class AddRowVersionToTimeSlot : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "TimeSlots",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "TimeSlots");
        }
    }
}