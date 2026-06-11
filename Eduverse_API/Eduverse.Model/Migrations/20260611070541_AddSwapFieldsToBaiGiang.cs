using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddSwapFieldsToBaiGiang : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "vitrixem",
                table: "tienDoHocTaps",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "IdBaiGiang",
                table: "taiLieus",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "IdGioHang",
                table: "gioHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "IdKhoaHoc",
                table: "danhMuc_KhoaHocs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "IdDanhMuc",
                table: "danhMuc_KhoaHocs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "LoaiCauHoi",
                table: "cauHois",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "IdPhan",
                table: "baiGiangs",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "IdBaiGiangMoi",
                table: "baiGiangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsPendingSwap",
                table: "baiGiangs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "a8bffce1-c158-48af-b79a-d3c46ef33c9e", "AQAAAAIAAYagAAAAEDdKRUP9rcmdlBWtEhuMqhE6oJlRRRe8Q9ydghkU4F+rh+/ENVDGWIbBqugSvlX68Q==", "9e7af46c-e095-4ff0-8310-98685219fd56" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "vitrixem",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "IdGioHang",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "IdBaiGiangMoi",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "IsPendingSwap",
                table: "baiGiangs");

            migrationBuilder.AlterColumn<Guid>(
                name: "IdBaiGiang",
                table: "taiLieus",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "IdKhoaHoc",
                table: "danhMuc_KhoaHocs",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<Guid>(
                name: "IdDanhMuc",
                table: "danhMuc_KhoaHocs",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AlterColumn<int>(
                name: "LoaiCauHoi",
                table: "cauHois",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "IdPhan",
                table: "baiGiangs",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "333018b6-68bc-4ac0-8476-c0f7989c4706", "AQAAAAIAAYagAAAAEL3Z3WLrOgCWtMVev0N4GYL1w3v55035ywXHiVwGibjAztwkDmIbzMj9/cqjhOqMFQ==", "a7f99f7e-8284-464b-91c1-0ea1b7fc443a" });
        }
    }
}
