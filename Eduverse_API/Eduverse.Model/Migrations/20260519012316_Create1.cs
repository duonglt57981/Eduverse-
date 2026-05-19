using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class Create1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MaGiaoDich",
                table: "donHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "f77f8573-df9e-44c9-9240-c2e710433ba2", "AQAAAAIAAYagAAAAEKJ9KAQUjI8RxQpftJizOesEXYp6DUs+F0oFcstBoVKNANIOPeBu4pYaumV2hoQ53w==", "0d4c674d-4cf0-42b0-bf3d-f063bb04b405" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaGiaoDich",
                table: "donHangs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "e72c7481-892a-4b30-a717-061d38a9e51f", "AQAAAAIAAYagAAAAENw8nQ/TV+a6+x+1V+AXBsypZRPlwf6fyXlA9iesIGBL3DAfHx0cgRFTuoXiWX4+4A==", "45ecee23-68ef-455a-befc-a41bc67af68a" });
        }
    }
}
