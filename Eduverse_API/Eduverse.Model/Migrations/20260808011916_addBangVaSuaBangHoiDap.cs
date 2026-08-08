using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class addBangVaSuaBangHoiDap : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "DaDong",
                table: "hoiDaps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "DaGhim",
                table: "hoiDaps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "GhimTraLoi",
                table: "hoiDaps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "IdHoiDapCha",
                table: "hoiDaps",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "LaGiangVien",
                table: "hoiDaps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "SoLike",
                table: "hoiDaps",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "likeHoiDaps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdHoiDap = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    IdNguoiDung = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_likeHoiDaps", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "c64ed735-57b2-404f-a9ef-869f3f76144b", "AQAAAAIAAYagAAAAEIO8/n3sKnY6IDA/cegIyfSv5M3tgfEO08c5a/Opxaj9Fl9TgWu60/QYmeURjidIdQ==", "676b6620-c84e-41ca-94fe-d31bb3eb431f" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "likeHoiDaps");

            migrationBuilder.DropColumn(
                name: "DaDong",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "DaGhim",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "GhimTraLoi",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "IdHoiDapCha",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "LaGiangVien",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "SoLike",
                table: "hoiDaps");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "f6cfee92-1368-4e5c-9481-da350c15b775", "AQAAAAIAAYagAAAAENuuaK+zZt+KX+sHoj4iPqwDScIAvnFSruE8kwZHOO4S1k9xNIfEe//2s9xzjGq6Kw==", "6a00e53d-bc05-4d0b-aa29-965c074bdecf" });
        }
    }
}
