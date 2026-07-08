using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddMaDanhMucToDanhMucTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MaDanhMuc",
                table: "danhMucs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "3e1f9cc7-5368-45f4-bf2d-d191a41f406f", "AQAAAAIAAYagAAAAEDSqSNj6pTsM8lQzLUI2foiHG3xtw3x7kTdSDkvVWeKrjmA2gCtnl1oYO+7Z2Sr5Dg==", "b7045cae-1474-42fa-80ce-b9a4fdff4ddd" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaDanhMuc",
                table: "danhMucs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a168bc61-d929-40c6-84a4-92684b2fa10f", "AQAAAAIAAYagAAAAEPu3bHoh0JFaDBUlxpCmm2mLO8vjh/Zdm4twdSP29pP/VJVNtOsnkXIvAnYndIipEA==", "55f610d8-b632-439c-8030-f140244cf1c8" });
        }
    }
}
