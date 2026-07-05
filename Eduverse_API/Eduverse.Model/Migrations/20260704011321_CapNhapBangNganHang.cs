using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class CapNhapBangNganHang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HinhAnhQR",
                table: "nganHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "38aa8029-e9dc-44dc-ac30-65dacfa1883a", "AQAAAAIAAYagAAAAELFtjaQZKCRL73RyKHUj82qADUhvVSfiqMVLwqxa+smUuTvn7sLzA08dUYQbh02w1w==", "0a401724-7add-41f9-a7e2-d489fa17efff" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HinhAnhQR",
                table: "nganHangs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a168bc61-d929-40c6-84a4-92684b2fa10f", "AQAAAAIAAYagAAAAEPu3bHoh0JFaDBUlxpCmm2mLO8vjh/Zdm4twdSP29pP/VJVNtOsnkXIvAnYndIipEA==", "55f610d8-b632-439c-8030-f140244cf1c8" });
        }
    }
}
