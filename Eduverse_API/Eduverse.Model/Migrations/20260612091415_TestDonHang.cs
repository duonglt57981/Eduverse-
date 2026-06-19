using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class TestDonHang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_KhoaHoc",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "IdGioHangChiTiet",
                table: "gioHangs");

            migrationBuilder.RenameTable(
                name: "KhoaHoc",
                newName: "KhoaHocs");

            migrationBuilder.AddPrimaryKey(
                name: "PK_KhoaHocs",
                table: "KhoaHocs",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "danhSachMuonMuaSaus",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNguoiDung = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdKhoaHoc = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_danhSachMuonMuaSaus", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "5d7a1dc2-d53b-4407-942b-c2f0f5cb0ca2", "AQAAAAIAAYagAAAAEBBSdN/qZWvGDQu91jNrsba2pVNuSOxDWhgEhywWY1ngFpIQd51yAoz3ZzhNQtilRg==", "119d576f-e52c-44a9-806b-bf27b1fc049e" });

            migrationBuilder.CreateIndex(
                name: "IX_donHangChiTiets_IdKhoaHoc",
                table: "donHangChiTiets",
                column: "IdKhoaHoc");

            migrationBuilder.AddForeignKey(
                name: "FK_donHangChiTiets_KhoaHocs_IdKhoaHoc",
                table: "donHangChiTiets",
                column: "IdKhoaHoc",
                principalTable: "KhoaHocs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_donHangChiTiets_KhoaHocs_IdKhoaHoc",
                table: "donHangChiTiets");

            migrationBuilder.DropTable(
                name: "danhSachMuonMuaSaus");

            migrationBuilder.DropIndex(
                name: "IX_donHangChiTiets_IdKhoaHoc",
                table: "donHangChiTiets");

            migrationBuilder.DropPrimaryKey(
                name: "PK_KhoaHocs",
                table: "KhoaHocs");

            migrationBuilder.RenameTable(
                name: "KhoaHocs",
                newName: "KhoaHoc");

            migrationBuilder.AddColumn<Guid>(
                name: "IdGioHangChiTiet",
                table: "gioHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_KhoaHoc",
                table: "KhoaHoc",
                column: "Id");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "333018b6-68bc-4ac0-8476-c0f7989c4706", "AQAAAAIAAYagAAAAEL3Z3WLrOgCWtMVev0N4GYL1w3v55035ywXHiVwGibjAztwkDmIbzMj9/cqjhOqMFQ==", "a7f99f7e-8284-464b-91c1-0ea1b7fc443a" });
        }
    }
}
