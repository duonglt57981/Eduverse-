using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IdDangKi",
                table: "dangKyKhoaHocs",
                newName: "IdKhoaHoc");

            migrationBuilder.AddColumn<string>(
                name: "TrangThai",
                table: "phans",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "2351f7d0-df71-4006-8221-a43a52d8d7cb", "AQAAAAIAAYagAAAAENlBKV3gSYs1kLc0KS/0f3J/6CMReihAh6f6IJuh+jaN2OMYrQXdemRRo5wEIeQfbw==", "8beea3ba-5d62-464f-b5a3-9f7ad0b2f7ca" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TrangThai",
                table: "phans");

            migrationBuilder.RenameColumn(
                name: "IdKhoaHoc",
                table: "dangKyKhoaHocs",
                newName: "IdDangKi");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "84335e52-f9e0-462d-9739-52919614e8a6", "AQAAAAIAAYagAAAAEAzdGOkPFdRG2HBoEt4VBjyU3Fus4crUr0Bmdb7PYBiA6+TPeU6Oj4maAzsgj6iiyg==", "702c3539-4200-4c0b-911f-a61bd2c9bb16" });
        }
    }
}
