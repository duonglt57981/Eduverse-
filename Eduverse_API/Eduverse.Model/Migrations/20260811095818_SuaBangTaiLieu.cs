using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class SuaBangTaiLieu : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NoiDungTrichXuat",
                table: "taiLieus",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "7b7fa60e-f8b7-43e5-aa6e-28538c38928b", "AQAAAAIAAYagAAAAENo26/BU4WGDa16PXH93DrtQOCva8OLFEbIdCfeXTc8TvX1hTmRDDNiYehVAHdDLbg==", "29f0ea82-5877-40c9-848d-3f97bab04b65" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NoiDungTrichXuat",
                table: "taiLieus");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "dcf137c2-8382-469b-9558-9320bcff029c", "AQAAAAIAAYagAAAAEChi/GHldApo03wdNIiWPh1jysAMhFbDYT+m4BMAkWX3wqhAUWYtkE+EcYUxZ0UJKA==", "806dcf2b-a290-4d09-bf76-be71995c1234" });
        }
    }
}
