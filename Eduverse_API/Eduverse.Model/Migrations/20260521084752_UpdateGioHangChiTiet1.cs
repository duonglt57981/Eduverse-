using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdateGioHangChiTiet1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdGioHang",
                table: "gioHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DonHangId",
                table: "donHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "1b9d233d-3ca1-4e0e-a1b4-76f17b5eef35", "AQAAAAIAAYagAAAAEPMdqkdnGWBeAZN0xLhapeZfrdWhRu6Y/xwP5FyItuBK3HVgUZMARqgT/SO3RKxruA==", "fae2c03d-a55c-4f5d-8138-f2a53e795c5c" });

            migrationBuilder.CreateIndex(
                name: "IX_donHangChiTiets_DonHangId",
                table: "donHangChiTiets",
                column: "DonHangId");

            migrationBuilder.AddForeignKey(
                name: "FK_donHangChiTiets_donHangs_DonHangId",
                table: "donHangChiTiets",
                column: "DonHangId",
                principalTable: "donHangs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_donHangChiTiets_donHangs_DonHangId",
                table: "donHangChiTiets");

            migrationBuilder.DropIndex(
                name: "IX_donHangChiTiets_DonHangId",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "IdGioHang",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "DonHangId",
                table: "donHangChiTiets");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "f77f8573-df9e-44c9-9240-c2e710433ba2", "AQAAAAIAAYagAAAAEKJ9KAQUjI8RxQpftJizOesEXYp6DUs+F0oFcstBoVKNANIOPeBu4pYaumV2hoQ53w==", "0d4c674d-4cf0-42b0-bf3d-f063bb04b405" });
        }
    }
}
