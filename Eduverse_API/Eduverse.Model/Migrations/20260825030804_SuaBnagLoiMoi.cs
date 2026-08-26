using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class SuaBnagLoiMoi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdKhuyenMai",
                table: "loiMoiGiangViens",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "440189f3-b923-4d23-8fbf-0464d480a506", "AQAAAAIAAYagAAAAEM3abXb0M5xEJ4aLoT/gZZs66Lrg4MYJPsb2caIkt+H7Abj6buP/pVhgF67DhqEoMw==", "33fd2cdc-ae47-4313-9db2-faf1bd4946d2" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdKhuyenMai",
                table: "loiMoiGiangViens");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "401a7b71-fdd9-419c-b3a7-bab750950180", "AQAAAAIAAYagAAAAEEt3hhMBjDRi+HHuskXe6tK+lGokbsMIR+MQN1YDnTdXx7TulyX90y1x1tkmj4xoag==", "01531abe-e3e1-408a-98af-3d9a138213af" });
        }
    }
}
