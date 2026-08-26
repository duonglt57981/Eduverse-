using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class FilterUniqueIndex_LoiMoiGiangVien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_loiMoiGiangViens_IdKhoaHoc_IdNguoiDuocMoi",
                table: "loiMoiGiangViens");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "ed62f798-d1c7-4757-83ab-c84633b74218", "AQAAAAIAAYagAAAAEGq4E7q4+DBwLFHwh5N1kcc4ZyAWH4l8QY3eSfXVONZSjjINTOjGgzFmRsXrWkxOLQ==", "0015bd7f-d377-43c7-a807-c8111eb4e807" });

            migrationBuilder.CreateIndex(
                name: "IX_loiMoiGiangViens_IdKhoaHoc_IdNguoiDuocMoi",
                table: "loiMoiGiangViens",
                columns: new[] { "IdKhoaHoc", "IdNguoiDuocMoi" },
                unique: true,
                filter: "[IsDeleted] = 0 AND [TrangThai] = N'Pending' AND [IdKhuyenMai] IS NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_loiMoiGiangViens_IdKhoaHoc_IdNguoiDuocMoi",
                table: "loiMoiGiangViens");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "440189f3-b923-4d23-8fbf-0464d480a506", "AQAAAAIAAYagAAAAEM3abXb0M5xEJ4aLoT/gZZs66Lrg4MYJPsb2caIkt+H7Abj6buP/pVhgF67DhqEoMw==", "33fd2cdc-ae47-4313-9db2-faf1bd4946d2" });

            migrationBuilder.CreateIndex(
                name: "IX_loiMoiGiangViens_IdKhoaHoc_IdNguoiDuocMoi",
                table: "loiMoiGiangViens",
                columns: new[] { "IdKhoaHoc", "IdNguoiDuocMoi" },
                unique: true);
        }
    }
}
