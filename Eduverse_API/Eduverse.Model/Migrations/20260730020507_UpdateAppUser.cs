using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAppUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CurrentDeviceInfo",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CurrentSessionAt",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrentSessionId",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "CurrentDeviceInfo", "CurrentSessionAt", "CurrentSessionId", "PasswordHash", "SecurityStamp" },
                values: new object[] { "93bcfad1-943c-45df-aa70-ee2a00976701", null, null, null, "AQAAAAIAAYagAAAAEM+C5lh3/7Iq8FHIkTXOpLl6VrjtOZajFiYmJhRpGboS1sKgRHgQnySOW1YqZlhf7Q==", "74803b7c-0a8e-46e7-aee8-a35bd31eb600" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentDeviceInfo",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CurrentSessionAt",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CurrentSessionId",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "800e3a5f-9584-4084-9bec-e01f148766c1", "AQAAAAIAAYagAAAAEHumgR0DqcptCqYEHV4hhIjvo9seW0gSly861y2bqpqrpG0n8KV8NPPo8mdwa0+Y3Q==", "cb7226c6-116e-4f90-b928-9e5ba70dfabb" });
        }
    }
}
