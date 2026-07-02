using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    [Migration("20260701000000_AddThongBaoNotificationFields")]
    public partial class AddThongBaoNotificationFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: ".");

            migrationBuilder.AddColumn<string>(
                name: "Link",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "FromUser",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ToUser",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsRead",
                table: "thongBaos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "thongBaos",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SendToFrontEndUser",
                table: "thongBaos",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ItemId",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ItemName",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ItemType",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDisplay",
                table: "thongBaos",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DonViId",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductId",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductName",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "NguoiTao",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileDinhKem",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsXuatBan",
                table: "thongBaos",
                type: "bit",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Message", table: "thongBaos");
            migrationBuilder.DropColumn(name: "Link", table: "thongBaos");
            migrationBuilder.DropColumn(name: "FromUser", table: "thongBaos");
            migrationBuilder.DropColumn(name: "ToUser", table: "thongBaos");
            migrationBuilder.DropColumn(name: "IsRead", table: "thongBaos");
            migrationBuilder.DropColumn(name: "Type", table: "thongBaos");
            migrationBuilder.DropColumn(name: "SendToFrontEndUser", table: "thongBaos");
            migrationBuilder.DropColumn(name: "ItemId", table: "thongBaos");
            migrationBuilder.DropColumn(name: "ItemName", table: "thongBaos");
            migrationBuilder.DropColumn(name: "ItemType", table: "thongBaos");
            migrationBuilder.DropColumn(name: "IsDisplay", table: "thongBaos");
            migrationBuilder.DropColumn(name: "DonViId", table: "thongBaos");
            migrationBuilder.DropColumn(name: "Email", table: "thongBaos");
            migrationBuilder.DropColumn(name: "ProductId", table: "thongBaos");
            migrationBuilder.DropColumn(name: "ProductName", table: "thongBaos");
            migrationBuilder.DropColumn(name: "NguoiTao", table: "thongBaos");
            migrationBuilder.DropColumn(name: "FileDinhKem", table: "thongBaos");
            migrationBuilder.DropColumn(name: "IsXuatBan", table: "thongBaos");
        }
    }
}
