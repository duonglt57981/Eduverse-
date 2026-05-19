using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class updatebaigiang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdVideoBaiGiang",
                table: "baiGiangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "aa771106-2ba2-4062-94b8-076f2e810afa", "AQAAAAIAAYagAAAAEB2LcsBkZCGpVDUBwahNW9dPpF0nC4k4cEdLNWItO1aHz2pUD6kM4fHyc556YoImHw==", "fa581dc8-154d-468a-abba-eb8a925608bd" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdVideoBaiGiang",
                table: "baiGiangs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "e72c7481-892a-4b30-a717-061d38a9e51f", "AQAAAAIAAYagAAAAENw8nQ/TV+a6+x+1V+AXBsypZRPlwf6fyXlA9iesIGBL3DAfHx0cgRFTuoXiWX4+4A==", "45ecee23-68ef-455a-befc-a41bc67af68a" });
        }
    }
}
