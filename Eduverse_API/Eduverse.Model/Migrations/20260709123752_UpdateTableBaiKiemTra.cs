using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTableBaiKiemTra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ThuTuSapXep",
                table: "baiKiemTras",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "c8c17b9a-90cf-45c7-8fba-247778a77f19", "AQAAAAIAAYagAAAAENL2JX2s5kCIea2vHOSmCztJ7aKe7+VwkjaIhwmvf5nlIOlXVVjqocJKaJtXpGgveA==", "9efd219f-99cf-4254-a7e5-f8e360a2d04c" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ThuTuSapXep",
                table: "baiKiemTras");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "627513c9-2ae8-47ec-a5a2-57640f96c8f8", "AQAAAAIAAYagAAAAEEMUlhUXpFo7t2JMiFIkSL0fbAJlT3Z2uKFBRBiFCKcsZhpheTVdG/Vo+YhQORwgug==", "86775bfb-189d-4ecc-a663-51fc6000b2e6" });
        }
    }
}
