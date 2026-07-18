using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class FixIdDoiTuong : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IdDoiDuong",
                table: "lichSuKiemDuyetKhoaHocs",
                newName: "IdDoiTuong");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "800e3a5f-9584-4084-9bec-e01f148766c1", "AQAAAAIAAYagAAAAEHumgR0DqcptCqYEHV4hhIjvo9seW0gSly861y2bqpqrpG0n8KV8NPPo8mdwa0+Y3Q==", "cb7226c6-116e-4f90-b928-9e5ba70dfabb" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IdDoiTuong",
                table: "lichSuKiemDuyetKhoaHocs",
                newName: "IdDoiDuong");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "c8c17b9a-90cf-45c7-8fba-247778a77f19", "AQAAAAIAAYagAAAAENL2JX2s5kCIea2vHOSmCztJ7aKe7+VwkjaIhwmvf5nlIOlXVVjqocJKaJtXpGgveA==", "9efd219f-99cf-4254-a7e5-f8e360a2d04c" });
        }
    }
}
