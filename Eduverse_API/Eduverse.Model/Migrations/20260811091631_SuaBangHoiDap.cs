using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class SuaBangHoiDap : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdTraLoiDuocReply",
                table: "hoiDaps",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "dcf137c2-8382-469b-9558-9320bcff029c", "AQAAAAIAAYagAAAAEChi/GHldApo03wdNIiWPh1jysAMhFbDYT+m4BMAkWX3wqhAUWYtkE+EcYUxZ0UJKA==", "806dcf2b-a290-4d09-bf76-be71995c1234" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdTraLoiDuocReply",
                table: "hoiDaps");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "4099e070-7095-43e7-ab4f-da6720922e30", "AQAAAAIAAYagAAAAEAtUzzHaQ1ZqSF9jEaVVekqLieu/cGFwRrkNZPuAVFZl7gVA7qVfVlyCrp0IvPYGCg==", "a22df90a-ac86-40a5-847d-5624c561ebfc" });
        }
    }
}
