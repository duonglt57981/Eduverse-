using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddEntyNgayHetHan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NgayHetHan",
                table: "dangKyKhoaHocs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "402b78fb-b009-4455-ace7-f7316beef448", "AQAAAAIAAYagAAAAEBRFwHYW9ZW+zbilgWnHnXU0jXuFER7Y1lj8dY2x2sVAu36lf1hnjQPAi3e80H/8jg==", "c5529cd5-98f2-4c66-a77f-103bda26359b" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NgayHetHan",
                table: "dangKyKhoaHocs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "93bcfad1-943c-45df-aa70-ee2a00976701", "AQAAAAIAAYagAAAAEM+C5lh3/7Iq8FHIkTXOpLl6VrjtOZajFiYmJhRpGboS1sKgRHgQnySOW1YqZlhf7Q==", "74803b7c-0a8e-46e7-aee8-a35bd31eb600" });
        }
    }
}
