using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class HoiDapCapNhap : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdBaiGiang",
                table: "hoiDaps",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "35b1e385-7e21-4a8a-a229-7e1fd0a19e05", "AQAAAAIAAYagAAAAEBR+dFhu/R3ITO8oqI9m8tieEuyZRAGCuM3ZXcB2SrpUPPrBrJMDSoo5aw2A84mdDw==", "6eda916d-dc65-4af0-9297-992669e9716d" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdBaiGiang",
                table: "hoiDaps");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "c64ed735-57b2-404f-a9ef-869f3f76144b", "AQAAAAIAAYagAAAAEIO8/n3sKnY6IDA/cegIyfSv5M3tgfEO08c5a/Opxaj9Fl9TgWu60/QYmeURjidIdQ==", "676b6620-c84e-41ca-94fe-d31bb3eb431f" });
        }
    }
}
