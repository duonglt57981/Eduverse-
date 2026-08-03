using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDanhGia : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdKhoaHoc",
                table: "danhGias",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SoSao",
                table: "danhGias",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "cc581283-bd7b-402e-9a3b-580dab15ad65", "AQAAAAIAAYagAAAAEJHwRbju7/3SvZSp/BQ6RjZ+ZgPTbqfQtObHWfgqdi69/TarEm/wrjJ7oU6llEeY9w==", "8300b077-32cf-4154-a2ad-c449b0bd560a" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdKhoaHoc",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "SoSao",
                table: "danhGias");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "aeb31476-4c2f-4f99-996d-8c9ee1e0f875", "AQAAAAIAAYagAAAAEEB5b4c6Gi5GEREW9v/iT/hPxPRm4dhjEM1gLlFEXlq7CEJVtHLIYsWj4qCN+Qptgw==", "7e663523-78f0-4df5-a5f7-2f99440df590" });
        }
    }
}
