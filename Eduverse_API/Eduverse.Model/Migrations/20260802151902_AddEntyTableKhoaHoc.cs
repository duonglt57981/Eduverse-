using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddEntyTableKhoaHoc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdNguoiDuyet",
                table: "KhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "bc5d3894-62c7-4dfb-a1b5-1bb33b9c110f", "AQAAAAIAAYagAAAAEGDd23Ap+PJ7Mnhm74QS2xBvB3Z4YxrsRQSRDf+iB2a71UB4KJKr+x+pGbVB0i01UA==", "ffa3e122-47cd-4584-91b3-7a52708b8ecb" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdNguoiDuyet",
                table: "KhoaHocs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "998ff4af-ecaf-4ab4-9c10-a69dbfb40b91", "AQAAAAIAAYagAAAAEFCIvBN8aSMhi2To7ZeZujUBC18wRBGXq3onCgs75JZMybQsyYqCqnrHqqJHzt+iNw==", "d47336f4-83cc-4d0b-8ef4-bfaf0de422e2" });
        }
    }
}
