using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityTableBaiGiangBaiKiemTra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdLyDo",
                table: "baiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "IdLyDo",
                table: "baiGiangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "bcf68c21-0e20-4f85-93d8-19a351a71421", "AQAAAAIAAYagAAAAEBMcXRDadW/1noOZyaoxpQxCC1nit3QMcRH3ZIblY0m+z2BMGU4npzhW/27B9wdopQ==", "c0da2e2c-9704-4ac9-990e-f7f6aa89d2e4" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdLyDo",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "IdLyDo",
                table: "baiGiangs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "35b1e385-7e21-4a8a-a229-7e1fd0a19e05", "AQAAAAIAAYagAAAAEBR+dFhu/R3ITO8oqI9m8tieEuyZRAGCuM3ZXcB2SrpUPPrBrJMDSoo5aw2A84mdDw==", "6eda916d-dc65-4af0-9297-992669e9716d" });
        }
    }
}
