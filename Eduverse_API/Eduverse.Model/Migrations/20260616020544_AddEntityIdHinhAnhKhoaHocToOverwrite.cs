using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityIdHinhAnhKhoaHocToOverwrite : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdHinhAnhKhoaHoc",
                table: "KhoaHocs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "84335e52-f9e0-462d-9739-52919614e8a6", "AQAAAAIAAYagAAAAEAzdGOkPFdRG2HBoEt4VBjyU3Fus4crUr0Bmdb7PYBiA6+TPeU6Oj4maAzsgj6iiyg==", "702c3539-4200-4c0b-911f-a61bd2c9bb16" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdHinhAnhKhoaHoc",
                table: "KhoaHocs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "8b23fc16-088f-4559-ac5b-787d80808d11", "AQAAAAIAAYagAAAAEOxm2Ve14DrPA0lJK4XTlnqaGqjdGnsr8IRBcJoVmM1G2P4sp+z38w7hFCAWUilnsg==", "4f5d954f-225b-4cbe-bf99-31862cfe2b46" });
        }
    }
}
