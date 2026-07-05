using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class addColumTaiLieu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "IdDocument",
                table: "taiLieus",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "d605b3c3-70b2-4bf1-bf00-dbcb486e416d", "AQAAAAIAAYagAAAAEIjtKwpZyJGoLtnH8bOGjRK8/FYUzTwk7nS7qVKVxRBVhuVBIafDmuIjLo1F2sbENw==", "c9584917-4b75-499b-bd8e-8b0b4de2f904" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdDocument",
                table: "taiLieus");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a168bc61-d929-40c6-84a4-92684b2fa10f", "AQAAAAIAAYagAAAAEPu3bHoh0JFaDBUlxpCmm2mLO8vjh/Zdm4twdSP29pP/VJVNtOsnkXIvAnYndIipEA==", "55f610d8-b632-439c-8030-f140244cf1c8" });
        }
    }
}
