using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TrangThaiPheDuyet",
                table: "taiLieus",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThaiPheDuyet",
                table: "phans",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThai",
                table: "dapAns",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThaiPheDuyet",
                table: "dapAns",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThai",
                table: "cauHois",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThaiPheDuyet",
                table: "cauHois",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThaiPheDuyet",
                table: "baiKiemTras",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TrangThaiPheDuyet",
                table: "baiGiangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "38c10270-f1fe-493f-98e3-b4832d8301d4", "AQAAAAIAAYagAAAAEC5fOOs/QOKAJu8zDio9yUlfLl+aFTxzewFuIFc1Q9kYGNHL1enrzP3OupIpo2J7qQ==", "3c788eec-37ab-4cd2-977d-199aec844717" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TrangThaiPheDuyet",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "TrangThaiPheDuyet",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "TrangThai",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "TrangThaiPheDuyet",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "TrangThai",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "TrangThaiPheDuyet",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "TrangThaiPheDuyet",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "TrangThaiPheDuyet",
                table: "baiGiangs");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "51735aee-eb4b-4604-a764-053fd1cfd8af", "AQAAAAIAAYagAAAAEEZSGEi3aY8OTeav6owFxmHJOAMEWKSwMlrpxqOdrDjoHq4RrM9vcRt/R2ysxD4FhA==", "fc18cd2c-ebd3-43be-a4e2-097fa6af5fe8" });
        }
    }
}
