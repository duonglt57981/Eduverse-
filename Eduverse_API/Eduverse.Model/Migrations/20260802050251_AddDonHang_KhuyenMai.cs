using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddDonHang_KhuyenMai : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DonHang_KhuyenMai",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDonHang = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdKhuyenMai = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    SoTienGiam = table.Column<double>(type: "float", nullable: true),
                    IdKhoaHocDuocGiam = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DonHangId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    KhuyenMaiId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_DonHang_KhuyenMai", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DonHang_KhuyenMai_donHangs_DonHangId",
                        column: x => x.DonHangId,
                        principalTable: "donHangs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DonHang_KhuyenMai_khuyenMais_KhuyenMaiId",
                        column: x => x.KhuyenMaiId,
                        principalTable: "khuyenMais",
                        principalColumn: "Id");
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "09d0a31a-84b8-4671-a633-808f0835d038", "AQAAAAIAAYagAAAAEGDKND7KXHhMnLfyL5lgPCld6bIPfAskfERsijRbQtle0EZpPNZBpBeaUhcEVgStJA==", "1df389f8-091d-4429-8f6f-ac58c639a52a" });

            migrationBuilder.CreateIndex(
                name: "IX_DonHang_KhuyenMai_DonHangId",
                table: "DonHang_KhuyenMai",
                column: "DonHangId");

            migrationBuilder.CreateIndex(
                name: "IX_DonHang_KhuyenMai_KhuyenMaiId",
                table: "DonHang_KhuyenMai",
                column: "KhuyenMaiId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DonHang_KhuyenMai");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "998ff4af-ecaf-4ab4-9c10-a69dbfb40b91", "AQAAAAIAAYagAAAAEFCIvBN8aSMhi2To7ZeZujUBC18wRBGXq3onCgs75JZMybQsyYqCqnrHqqJHzt+iNw==", "d47336f4-83cc-4d0b-8ef4-bfaf0de422e2" });
        }
    }
}
