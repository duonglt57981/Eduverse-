using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class Add2BangLoiMoiVaGiangVienKhoa : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "khoaHoc_GiangViens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdKhoaHoc = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdGiangVien = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    LaChuSoHuu = table.Column<bool>(type: "bit", nullable: false),
                    Visible = table.Column<bool>(type: "bit", nullable: false),
                    TyLeChiaDoanhThu = table.Column<int>(type: "int", nullable: false),
                    Manage = table.Column<bool>(type: "bit", nullable: false),
                    Performance = table.Column<bool>(type: "bit", nullable: false),
                    QnA = table.Column<bool>(type: "bit", nullable: false),
                    Reviews = table.Column<bool>(type: "bit", nullable: false),
                    Assignments = table.Column<bool>(type: "bit", nullable: false),
                    Materials = table.Column<bool>(type: "bit", nullable: false),
                    Promotions = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_khoaHoc_GiangViens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "loiMoiGiangViens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdKhoaHoc = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNguoiMoi = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNguoiDuocMoi = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmailDuocMoi = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NgayPhanHoi = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Visible = table.Column<bool>(type: "bit", nullable: false),
                    TyLeChiaDoanhThu = table.Column<int>(type: "int", nullable: false),
                    Manage = table.Column<bool>(type: "bit", nullable: false),
                    Performance = table.Column<bool>(type: "bit", nullable: false),
                    QnA = table.Column<bool>(type: "bit", nullable: false),
                    Reviews = table.Column<bool>(type: "bit", nullable: false),
                    Assignments = table.Column<bool>(type: "bit", nullable: false),
                    Materials = table.Column<bool>(type: "bit", nullable: false),
                    Promotions = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_loiMoiGiangViens", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "f6cfee92-1368-4e5c-9481-da350c15b775", "AQAAAAIAAYagAAAAENuuaK+zZt+KX+sHoj4iPqwDScIAvnFSruE8kwZHOO4S1k9xNIfEe//2s9xzjGq6Kw==", "6a00e53d-bc05-4d0b-aa29-965c074bdecf" });

            migrationBuilder.CreateIndex(
                name: "IX_khoaHoc_GiangViens_IdKhoaHoc_IdGiangVien",
                table: "khoaHoc_GiangViens",
                columns: new[] { "IdKhoaHoc", "IdGiangVien" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_loiMoiGiangViens_IdKhoaHoc_IdNguoiDuocMoi",
                table: "loiMoiGiangViens",
                columns: new[] { "IdKhoaHoc", "IdNguoiDuocMoi" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "khoaHoc_GiangViens");

            migrationBuilder.DropTable(
                name: "loiMoiGiangViens");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "cc581283-bd7b-402e-9a3b-580dab15ad65", "AQAAAAIAAYagAAAAEJHwRbju7/3SvZSp/BQ6RjZ+ZgPTbqfQtObHWfgqdi69/TarEm/wrjJ7oU6llEeY9w==", "8300b077-32cf-4154-a2ad-c449b0bd560a" });
        }
    }
}
