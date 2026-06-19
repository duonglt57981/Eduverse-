using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityToKiemDuyet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "IdBanGhiTruoc",
                table: "phans",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBanHienTai",
                table: "phans",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "IdBanGhiTruoc",
                table: "KhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBanHienTai",
                table: "KhoaHocs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "IdBanGhiTruoc",
                table: "dapAns",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBanHienTai",
                table: "dapAns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "IdBanGhiTruoc",
                table: "cauHois",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBanHienTai",
                table: "cauHois",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "IdBanGhiTruoc",
                table: "baiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBanHienTai",
                table: "baiKiemTras",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "IdBanGhiTruoc",
                table: "baiGiangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBanHienTai",
                table: "baiGiangs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "58056222-22f8-4a4d-963c-fcbb3b90df30", "AQAAAAIAAYagAAAAEGetmSkKwnQZuViDMPX1xLlsepBmkYqcdVxIAd8IHZCLpNY8Hh4W4FIlKcayS4fVDQ==", "dafe94d6-f4a1-4a71-b190-7c386decff4d" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IdBanGhiTruoc",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "IsBanHienTai",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "IdBanGhiTruoc",
                table: "KhoaHocs");

            migrationBuilder.DropColumn(
                name: "IsBanHienTai",
                table: "KhoaHocs");

            migrationBuilder.DropColumn(
                name: "IdBanGhiTruoc",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "IsBanHienTai",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "IdBanGhiTruoc",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "IsBanHienTai",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "IdBanGhiTruoc",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "IsBanHienTai",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "IdBanGhiTruoc",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "IsBanHienTai",
                table: "baiGiangs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "2351f7d0-df71-4006-8221-a43a52d8d7cb", "AQAAAAIAAYagAAAAENlBKV3gSYs1kLc0KS/0f3J/6CMReihAh6f6IJuh+jaN2OMYrQXdemRRo5wEIeQfbw==", "8beea3ba-5d62-464f-b5a3-9f7ad0b2f7ca" });
        }
    }
}
