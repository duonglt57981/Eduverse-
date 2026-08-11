using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseReviewerAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "TrangThaiPheDuyet",
                table: "KhoaHocs",
                type: "nvarchar(450)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "PhanCongKiemDuyetKhoaHocs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdKhoaHoc = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNguoiDuyet = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNguoiPhanCong = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    NgayPhanCong = table.Column<DateTime>(type: "datetime2", nullable: false),
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
                    table.PrimaryKey("PK_PhanCongKiemDuyetKhoaHocs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhanCongKiemDuyetKhoaHocs_AspNetUsers_IdNguoiDuyet",
                        column: x => x.IdNguoiDuyet,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PhanCongKiemDuyetKhoaHocs_AspNetUsers_IdNguoiPhanCong",
                        column: x => x.IdNguoiPhanCong,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PhanCongKiemDuyetKhoaHocs_KhoaHocs_IdKhoaHoc",
                        column: x => x.IdKhoaHoc,
                        principalTable: "KhoaHocs",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_KhoaHocs_IdNguoiDuyet",
                table: "KhoaHocs",
                column: "IdNguoiDuyet");

            migrationBuilder.CreateIndex(
                name: "IX_KhoaHocs_TrangThaiPheDuyet_IdNguoiDuyet",
                table: "KhoaHocs",
                columns: new[] { "TrangThaiPheDuyet", "IdNguoiDuyet" });

            migrationBuilder.CreateIndex(
                name: "IX_PhanCongKiemDuyetKhoaHocs_IdKhoaHoc_NgayPhanCong",
                table: "PhanCongKiemDuyetKhoaHocs",
                columns: new[] { "IdKhoaHoc", "NgayPhanCong" });

            migrationBuilder.CreateIndex(
                name: "IX_PhanCongKiemDuyetKhoaHocs_IdNguoiDuyet_NgayPhanCong",
                table: "PhanCongKiemDuyetKhoaHocs",
                columns: new[] { "IdNguoiDuyet", "NgayPhanCong" });

            migrationBuilder.CreateIndex(
                name: "IX_PhanCongKiemDuyetKhoaHocs_IdNguoiPhanCong",
                table: "PhanCongKiemDuyetKhoaHocs",
                column: "IdNguoiPhanCong");

            migrationBuilder.AddForeignKey(
                name: "FK_KhoaHocs_AspNetUsers_IdNguoiDuyet",
                table: "KhoaHocs",
                column: "IdNguoiDuyet",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KhoaHocs_AspNetUsers_IdNguoiDuyet",
                table: "KhoaHocs");

            migrationBuilder.DropTable(
                name: "PhanCongKiemDuyetKhoaHocs");

            migrationBuilder.DropIndex(
                name: "IX_KhoaHocs_IdNguoiDuyet",
                table: "KhoaHocs");

            migrationBuilder.DropIndex(
                name: "IX_KhoaHocs_TrangThaiPheDuyet_IdNguoiDuyet",
                table: "KhoaHocs");

            migrationBuilder.AlterColumn<string>(
                name: "TrangThaiPheDuyet",
                table: "KhoaHocs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)",
                oldNullable: true);

        }
    }
}
