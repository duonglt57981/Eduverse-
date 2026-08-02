using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class dbsetchodhkm : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DonHang_KhuyenMai_donHangs_DonHangId",
                table: "DonHang_KhuyenMai");

            migrationBuilder.DropForeignKey(
                name: "FK_DonHang_KhuyenMai_khuyenMais_KhuyenMaiId",
                table: "DonHang_KhuyenMai");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DonHang_KhuyenMai",
                table: "DonHang_KhuyenMai");

            migrationBuilder.RenameTable(
                name: "DonHang_KhuyenMai",
                newName: "DonHang_KhuyenMais");

            migrationBuilder.RenameIndex(
                name: "IX_DonHang_KhuyenMai_KhuyenMaiId",
                table: "DonHang_KhuyenMais",
                newName: "IX_DonHang_KhuyenMais_KhuyenMaiId");

            migrationBuilder.RenameIndex(
                name: "IX_DonHang_KhuyenMai_DonHangId",
                table: "DonHang_KhuyenMais",
                newName: "IX_DonHang_KhuyenMais_DonHangId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DonHang_KhuyenMais",
                table: "DonHang_KhuyenMais",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "aeb31476-4c2f-4f99-996d-8c9ee1e0f875", "AQAAAAIAAYagAAAAEEB5b4c6Gi5GEREW9v/iT/hPxPRm4dhjEM1gLlFEXlq7CEJVtHLIYsWj4qCN+Qptgw==", "7e663523-78f0-4df5-a5f7-2f99440df590" });

            migrationBuilder.AddForeignKey(
                name: "FK_DonHang_KhuyenMais_donHangs_DonHangId",
                table: "DonHang_KhuyenMais",
                column: "DonHangId",
                principalTable: "donHangs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DonHang_KhuyenMais_khuyenMais_KhuyenMaiId",
                table: "DonHang_KhuyenMais",
                column: "KhuyenMaiId",
                principalTable: "khuyenMais",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DonHang_KhuyenMais_donHangs_DonHangId",
                table: "DonHang_KhuyenMais");

            migrationBuilder.DropForeignKey(
                name: "FK_DonHang_KhuyenMais_khuyenMais_KhuyenMaiId",
                table: "DonHang_KhuyenMais");

            migrationBuilder.DropPrimaryKey(
                name: "PK_DonHang_KhuyenMais",
                table: "DonHang_KhuyenMais");

            migrationBuilder.RenameTable(
                name: "DonHang_KhuyenMais",
                newName: "DonHang_KhuyenMai");

            migrationBuilder.RenameIndex(
                name: "IX_DonHang_KhuyenMais_KhuyenMaiId",
                table: "DonHang_KhuyenMai",
                newName: "IX_DonHang_KhuyenMai_KhuyenMaiId");

            migrationBuilder.RenameIndex(
                name: "IX_DonHang_KhuyenMais_DonHangId",
                table: "DonHang_KhuyenMai",
                newName: "IX_DonHang_KhuyenMai_DonHangId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_DonHang_KhuyenMai",
                table: "DonHang_KhuyenMai",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "09d0a31a-84b8-4671-a633-808f0835d038", "AQAAAAIAAYagAAAAEGDKND7KXHhMnLfyL5lgPCld6bIPfAskfERsijRbQtle0EZpPNZBpBeaUhcEVgStJA==", "1df389f8-091d-4429-8f6f-ac58c639a52a" });

            migrationBuilder.AddForeignKey(
                name: "FK_DonHang_KhuyenMai_donHangs_DonHangId",
                table: "DonHang_KhuyenMai",
                column: "DonHangId",
                principalTable: "donHangs",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DonHang_KhuyenMai_khuyenMais_KhuyenMaiId",
                table: "DonHang_KhuyenMai",
                column: "KhuyenMaiId",
                principalTable: "khuyenMais",
                principalColumn: "Id");
        }
    }
}
