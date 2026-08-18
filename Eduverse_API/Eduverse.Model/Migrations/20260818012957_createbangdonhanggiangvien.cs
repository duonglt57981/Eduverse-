using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class createbangdonhanggiangvien : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "donHang_GiangViens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDonHang = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdDonHangChiTiet = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdKhoaHoc = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGiangVien = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LaChuSoHuu = table.Column<bool>(type: "bit", nullable: false),
                    TyLeChiaDoanhThu = table.Column<int>(type: "int", nullable: false),
                    GiaLucDat = table.Column<double>(type: "float", nullable: false),
                    SoTienGiam = table.Column<double>(type: "float", nullable: false),
                    SoTienNhan = table.Column<double>(type: "float", nullable: false),
                    NgayGhiNhan = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    table.PrimaryKey("PK_donHang_GiangViens", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "401a7b71-fdd9-419c-b3a7-bab750950180", "AQAAAAIAAYagAAAAEEt3hhMBjDRi+HHuskXe6tK+lGokbsMIR+MQN1YDnTdXx7TulyX90y1x1tkmj4xoag==", "01531abe-e3e1-408a-98af-3d9a138213af" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "donHang_GiangViens");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "7b7fa60e-f8b7-43e5-aa6e-28538c38928b", "AQAAAAIAAYagAAAAENo26/BU4WGDa16PXH93DrtQOCva8OLFEbIdCfeXTc8TvX1hTmRDDNiYehVAHdDLbg==", "29f0ea82-5877-40c9-848d-3f97bab04b65" });
        }
    }
}
