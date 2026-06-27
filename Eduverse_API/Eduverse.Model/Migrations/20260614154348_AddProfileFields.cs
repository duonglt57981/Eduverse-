using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AnhBia",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgaySinh",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TieuSu",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "AnhBia", "ConcurrencyStamp", "NgaySinh", "PasswordHash", "SecurityStamp", "TieuSu" },
                values: new object[] { null, "e78dae65-27bd-42a4-baed-227e3c8a0209", null, "AQAAAAIAAYagAAAAEJhxtHx9zLkBOWCQBn5AOAMkp8WEp4nbFRFrVX5Vh6F+z6fYahfHBy/wgMkNqS+1Zg==", "f46742cf-dfce-418a-93b2-c4020a24bee4", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnhBia",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "NgaySinh",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "TieuSu",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "5d7a1dc2-d53b-4407-942b-c2f0f5cb0ca2", "AQAAAAIAAYagAAAAEBBSdN/qZWvGDQu91jNrsba2pVNuSOxDWhgEhywWY1ngFpIQd51yAoz3ZzhNQtilRg==", "119d576f-e52c-44a9-806b-bf27b1fc049e" });
        }
    }
}
