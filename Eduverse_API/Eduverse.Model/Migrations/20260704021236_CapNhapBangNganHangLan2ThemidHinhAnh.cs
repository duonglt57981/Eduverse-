using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class CapNhapBangNganHangLan2ThemidHinhAnh : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PublicIdHinhAnhQR",
                table: "nganHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "627513c9-2ae8-47ec-a5a2-57640f96c8f8", "AQAAAAIAAYagAAAAEEMUlhUXpFo7t2JMiFIkSL0fbAJlT3Z2uKFBRBiFCKcsZhpheTVdG/Vo+YhQORwgug==", "86775bfb-189d-4ecc-a663-51fc6000b2e6" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublicIdHinhAnhQR",
                table: "nganHangs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "38aa8029-e9dc-44dc-ac30-65dacfa1883a", "AQAAAAIAAYagAAAAELFtjaQZKCRL73RyKHUj82qADUhvVSfiqMVLwqxa+smUuTvn7sLzA08dUYQbh02w1w==", "0a401724-7add-41f9-a7e2-d489fa17efff" });
        }
    }
}
