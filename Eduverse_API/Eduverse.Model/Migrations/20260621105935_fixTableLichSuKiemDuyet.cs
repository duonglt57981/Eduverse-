using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class fixTableLichSuKiemDuyet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IdKhoaHoc",
                table: "lichSuKiemDuyetKhoaHocs",
                newName: "IdDoiDuong");

            migrationBuilder.AddColumn<string>(
                name: "LoaiDoiTuong",
                table: "lichSuKiemDuyetKhoaHocs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "51735aee-eb4b-4604-a764-053fd1cfd8af", "AQAAAAIAAYagAAAAEEZSGEi3aY8OTeav6owFxmHJOAMEWKSwMlrpxqOdrDjoHq4RrM9vcRt/R2ysxD4FhA==", "fc18cd2c-ebd3-43be-a4e2-097fa6af5fe8" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LoaiDoiTuong",
                table: "lichSuKiemDuyetKhoaHocs");

            migrationBuilder.RenameColumn(
                name: "IdDoiDuong",
                table: "lichSuKiemDuyetKhoaHocs",
                newName: "IdKhoaHoc");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "e78dae65-27bd-42a4-baed-227e3c8a0209", "AQAAAAIAAYagAAAAEJhxtHx9zLkBOWCQBn5AOAMkp8WEp4nbFRFrVX5Vh6F+z6fYahfHBy/wgMkNqS+1Zg==", "f46742cf-dfce-418a-93b2-c4020a24bee4" });
        }
    }
}
