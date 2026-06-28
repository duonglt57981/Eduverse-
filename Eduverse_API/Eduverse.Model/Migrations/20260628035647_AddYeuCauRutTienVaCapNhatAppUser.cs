using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddYeuCauRutTienVaCapNhatAppUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdNguoiDung",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "IdNguoiDung",
                table: "nganHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenNganHang",
                table: "nganHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "SoDuTaiKhoan",
                table: "AspNetUsers",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "yeuCauRutTiens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SoTienRut = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayYeuCau = table.Column<DateTime>(type: "datetime2", nullable: true),
                    NgayXuLy = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IdNguoiDung = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdNganHang = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_yeuCauRutTiens", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp", "SoDuTaiKhoan" },
                values: new object[] { "a168bc61-d929-40c6-84a4-92684b2fa10f", "AQAAAAIAAYagAAAAEPu3bHoh0JFaDBUlxpCmm2mLO8vjh/Zdm4twdSP29pP/VJVNtOsnkXIvAnYndIipEA==", "55f610d8-b632-439c-8030-f140244cf1c8", 0m });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "yeuCauRutTiens");

            migrationBuilder.DropColumn(
                name: "IdNguoiDung",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "IdNguoiDung",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "TenNganHang",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "SoDuTaiKhoan",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "aeff8bf2-6027-49d1-9470-337e5b3dde5f", "AQAAAAIAAYagAAAAEBNDqYfAKaPSL5dbjFEHebMr/DT8uo3je7954gwcPN3vC9uL0/EBDHbRTyjg/apdLA==", "449f2f49-2f63-4f73-8285-c8a58dd76506" });
        }
    }
}
