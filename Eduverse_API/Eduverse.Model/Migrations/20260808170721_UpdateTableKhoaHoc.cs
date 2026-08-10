using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTableKhoaHoc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdLyDoTuChoi",
                table: "KhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "164e03a1-9c5d-4ced-9da9-6834a2ab96e0", "AQAAAAIAAYagAAAAEPwcrHn26VqlwfWqb95t3b4rZ48KsBr1z2D8rh1tXCLDJsC5BnFI4q83upjwTOOdqg==", "268612d0-73c1-4705-88bd-616db0bbb053" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdLyDoTuChoi",
                table: "KhoaHocs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "bcf68c21-0e20-4f85-93d8-19a351a71421", "AQAAAAIAAYagAAAAEBMcXRDadW/1noOZyaoxpQxCC1nit3QMcRH3ZIblY0m+z2BMGU4npzhW/27B9wdopQ==", "c0da2e2c-9704-4ac9-990e-f7f6aa89d2e4" });
        }
    }
}
