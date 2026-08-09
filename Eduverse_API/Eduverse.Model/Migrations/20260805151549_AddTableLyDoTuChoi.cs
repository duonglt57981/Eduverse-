using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddTableLyDoTuChoi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "f31de608-9cfa-4724-9d69-f3f9255c538a", "AQAAAAIAAYagAAAAEMIs1UKZgj25ZNtKP1LcgUNlxM9/pRPi8tYMSjqiVc4bczIIGlz7FWoYFx5V6ty5Iw==", "9c3cd82e-eabd-4719-ba9a-d1c6689d27aa" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "cc581283-bd7b-402e-9a3b-580dab15ad65", "AQAAAAIAAYagAAAAEJHwRbju7/3SvZSp/BQ6RjZ+ZgPTbqfQtObHWfgqdi69/TarEm/wrjJ7oU6llEeY9w==", "8300b077-32cf-4154-a2ad-c449b0bd560a" });
        }
    }
}
