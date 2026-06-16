using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddTableLichSuKiemDuyetKhoaHoc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "lichSuKiemDuyetKhoaHocs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdKhoaHoc = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IdNguoiDuyet = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    TrangThaiPheDuyet = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LyDo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayDuyet = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_lichSuKiemDuyetKhoaHocs", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "8b23fc16-088f-4559-ac5b-787d80808d11", "AQAAAAIAAYagAAAAEOxm2Ve14DrPA0lJK4XTlnqaGqjdGnsr8IRBcJoVmM1G2P4sp+z38w7hFCAWUilnsg==", "4f5d954f-225b-4cbe-bf99-31862cfe2b46" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lichSuKiemDuyetKhoaHocs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "5d7a1dc2-d53b-4407-942b-c2f0f5cb0ca2", "AQAAAAIAAYagAAAAEBBSdN/qZWvGDQu91jNrsba2pVNuSOxDWhgEhywWY1ngFpIQd51yAoz3ZzhNQtilRg==", "119d576f-e52c-44a9-806b-bf27b1fc049e" });
        }
    }
}
