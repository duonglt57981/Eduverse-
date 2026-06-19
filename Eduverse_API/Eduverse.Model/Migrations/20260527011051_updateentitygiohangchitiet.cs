using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class updateentitygiohangchitiet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdGioHang",
                table: "gioHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "ac2244e9-4489-4903-971e-917237047ad1", "AQAAAAIAAYagAAAAEIIBRVt1BKjpIe7b+ymvUqupNtDlVO0mLkySU61ckd/LZ6qfE2XJC8yeSAVs7AOkng==", "5a582382-b05d-462c-b59f-5cc13c9934e5" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdGioHang",
                table: "gioHangChiTiets");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "333018b6-68bc-4ac0-8476-c0f7989c4706", "AQAAAAIAAYagAAAAEL3Z3WLrOgCWtMVev0N4GYL1w3v55035ywXHiVwGibjAztwkDmIbzMj9/cqjhOqMFQ==", "a7f99f7e-8284-464b-91c1-0ea1b7fc443a" });
        }
    }
}
