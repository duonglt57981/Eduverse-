using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class fixdecimal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Role_AuditableEntities_Id",
                table: "Role");

            migrationBuilder.DropForeignKey(
                name: "FK_taiLieus_AuditableEntities_Id",
                table: "taiLieus");

            migrationBuilder.DropForeignKey(
                name: "FK_thanhToans_AuditableEntities_Id",
                table: "thanhToans");

            migrationBuilder.DropForeignKey(
                name: "FK_thongBaos_AuditableEntities_Id",
                table: "thongBaos");

            migrationBuilder.DropForeignKey(
                name: "FK_tienDoHocTaps_AuditableEntities_Id",
                table: "tienDoHocTaps");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRole_AuditableEntities_Id",
                table: "UserRole");

            migrationBuilder.DropForeignKey(
                name: "FK_vaiTro_NguoiDungs_AuditableEntities_Id",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropTable(
                name: "AuditableEntities");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "vaiTro_NguoiDungs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "vaiTro_NguoiDungs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "vaiTro_NguoiDungs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "vaiTro_NguoiDungs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "vaiTro_NguoiDungs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "vaiTro_NguoiDungs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "vaiTro_NguoiDungs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "vaiTro_NguoiDungs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "vaiTro_NguoiDungs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "UserRole",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "UserRole",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "UserRole",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "UserRole",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "UserRole",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "UserRole",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "UserRole",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "UserRole",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "UserRole",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "tienDoHocTaps",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "tienDoHocTaps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "tienDoHocTaps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "tienDoHocTaps",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "tienDoHocTaps",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "tienDoHocTaps",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "tienDoHocTaps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "tienDoHocTaps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "tienDoHocTaps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "tienDoHocTaps",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "thongBaos",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "thongBaos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "thongBaos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "thongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "thongBaos",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "thongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "SoTien",
                table: "thanhToans",
                type: "float",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "thanhToans",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "thanhToans",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "thanhToans",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "thanhToans",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "thanhToans",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "thanhToans",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "thanhToans",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "thanhToans",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "thanhToans",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "taiLieus",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "taiLieus",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "taiLieus",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "taiLieus",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "taiLieus",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "taiLieus",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "taiLieus",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "taiLieus",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "taiLieus",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "taiLieus",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Role",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "Role",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "Role",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "Role",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "Role",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Role",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Role",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "Role",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "Role",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "phans",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "phans",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "phans",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "phans",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "phans",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "phans",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "phans",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "phans",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "phans",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "nganHangs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "nganHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "nganHangs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "nganHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "nganHangs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "nganHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "nganHangs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "nganHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "nganHangs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "nganHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "loaiThongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "loaiThongBaos",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "loaiThongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "loaiThongBaos",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "loaiThongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "loaiThongBaos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "loaiThongBaos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "loaiThongBaos",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "loaiThongBaos",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "lienKets",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "lienKets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "lienKets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "lienKets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "lienKets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "lienKets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "lienKets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "lienKets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "lienKets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "lienKets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "lanLamBaiKiemTras",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "lanLamBaiKiemTras",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "lanLamBaiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "lanLamBaiKiemTras",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "lanLamBaiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "lanLamBaiKiemTras",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "lanLamBaiKiemTras",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "lanLamBaiKiemTras",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "lanLamBaiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MaGiamGia",
                table: "khuyenMais",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "khuyenMais",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "khuyenMais",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "khuyenMais",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "khuyenMais",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "khuyenMais",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "khuyenMais",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "khuyenMais",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "khuyenMais",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "khuyenMais",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "khuyenMai_KhoaHocs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "khuyenMai_KhoaHocs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "khuyenMai_KhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "khuyenMai_KhoaHocs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "khuyenMai_KhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "khuyenMai_KhoaHocs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "khuyenMai_KhoaHocs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "khuyenMai_KhoaHocs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "khuyenMai_KhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThaiPheDuyet",
                table: "KhoaHoc",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "KhoaHoc",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "KhoaHoc",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "KhoaHoc",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "KhoaHoc",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "KhoaHoc",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "KhoaHoc",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "KhoaHoc",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "KhoaHoc",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "KhoaHoc",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "KhoaHoc",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Diem",
                table: "ketQuaBaiThis",
                type: "float",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "ketQuaBaiThis",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "ketQuaBaiThis",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "ketQuaBaiThis",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "ketQuaBaiThis",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "ketQuaBaiThis",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "ketQuaBaiThis",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "ketQuaBaiThis",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "ketQuaBaiThis",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "ketQuaBaiThis",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "hoiDaps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "hoiDaps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "hoiDaps",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "hoiDaps",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "hoiDaps",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "hoiDaps",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "hoiDaps",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "hoiDaps",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "hoiDaps",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "gioHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "gioHangs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "gioHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "gioHangs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "gioHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "gioHangs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "gioHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "gioHangs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "gioHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "gioHangChiTiets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "gioHangChiTiets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "gioHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "gioHangChiTiets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "gioHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "gioHangChiTiets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "gioHangChiTiets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "gioHangChiTiets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "gioHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "SoTienThanhToan",
                table: "donHangs",
                type: "float",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "SoTienGiamGia",
                table: "donHangs",
                type: "float",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "donHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "donHangs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "donHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "donHangs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "donHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "donHangs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "donHangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "donHangs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "donHangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "GiaLucDat",
                table: "donHangChiTiets",
                type: "float",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "donHangChiTiets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "donHangChiTiets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "donHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "donHangChiTiets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "donHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DonHangId",
                table: "donHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "donHangChiTiets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "donHangChiTiets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "donHangChiTiets",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "donHangChiTiets",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "dapAns",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "dapAns",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "dapAns",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "dapAns",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "dapAns",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "dapAns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "dapAns",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "dapAns",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "dapAns",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "DiemDatDuoc",
                table: "dapAn_NguoiDungs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "dapAn_NguoiDungs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "dapAn_NguoiDungs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "dapAn_NguoiDungs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "dapAn_NguoiDungs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "dapAn_NguoiDungs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "dapAn_NguoiDungs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "dapAn_NguoiDungs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "dapAn_NguoiDungs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "dapAn_NguoiDungs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "danhSachYeuThiches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "danhSachYeuThiches",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "danhSachYeuThiches",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "danhSachYeuThiches",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "danhSachYeuThiches",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "danhSachYeuThiches",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "danhSachYeuThiches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "danhSachYeuThiches",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "danhSachYeuThiches",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "danhMucs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "danhMucs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "danhMucs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "danhMucs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "danhMucs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "danhMucs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "danhMucs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "danhMucs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "danhMucs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "danhMucs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "danhMuc_KhoaHocs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "danhMuc_KhoaHocs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "danhMuc_KhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "danhMuc_KhoaHocs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "danhMuc_KhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "danhMuc_KhoaHocs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "danhMuc_KhoaHocs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "danhMuc_KhoaHocs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "danhMuc_KhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "danhGias",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "danhGias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "danhGias",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "danhGias",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "danhGias",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "danhGias",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "danhGias",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "danhGias",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "danhGias",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "danhGias",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "dangKyKhoaHocs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "GiaDangKy",
                table: "dangKyKhoaHocs",
                type: "float",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "dangKyKhoaHocs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "dangKyKhoaHocs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "dangKyKhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "dangKyKhoaHocs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "dangKyKhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "dangKyKhoaHocs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "dangKyKhoaHocs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "dangKyKhoaHocs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "dangKyKhoaHocs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "chungChis",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "chungChis",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "chungChis",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "chungChis",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "chungChis",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "chungChis",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "chungChis",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "chungChis",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "chungChis",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "chungChis",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "chiTietLamBaiKiemTras",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "chiTietLamBaiKiemTras",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "chiTietLamBaiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "chiTietLamBaiKiemTras",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "chiTietLamBaiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "chiTietLamBaiKiemTras",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "chiTietLamBaiKiemTras",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "chiTietLamBaiKiemTras",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "chiTietLamBaiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "cauHois",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "cauHois",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "cauHois",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "cauHois",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "cauHois",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "cauHois",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "cauHois",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "cauHois",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "cauHois",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "baiKiemTras",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(bool),
                oldType: "bit",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "baiKiemTras",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "baiKiemTras",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "baiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "baiKiemTras",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "baiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "baiKiemTras",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "baiKiemTras",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "baiKiemTras",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "baiKiemTras",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TrangThai",
                table: "baiGiangs",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "baiGiangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDate",
                table: "baiGiangs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "CreatedId",
                table: "baiGiangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedDate",
                table: "baiGiangs",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DeletedId",
                table: "baiGiangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "baiGiangs",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "baiGiangs",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedDate",
                table: "baiGiangs",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<Guid>(
                name: "UpdatedId",
                table: "baiGiangs",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "e0c81e6e-ad86-4d97-90d9-b109da5a66a9", "AQAAAAIAAYagAAAAEAW6QHIosx4lmL7Mq5wsLZUcyF6KrOJGxiA6SsFbhzKE2VorKcmfP67mu4ysHjpTRg==", "cea93b27-de60-48a7-9aff-a848eaab1a8a" });

            migrationBuilder.CreateIndex(
                name: "IX_donHangChiTiets_DonHangId",
                table: "donHangChiTiets",
                column: "DonHangId");

            migrationBuilder.AddForeignKey(
                name: "FK_donHangChiTiets_donHangs_DonHangId",
                table: "donHangChiTiets",
                column: "DonHangId",
                principalTable: "donHangs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_donHangChiTiets_donHangs_DonHangId",
                table: "donHangChiTiets");

            migrationBuilder.DropIndex(
                name: "IX_donHangChiTiets_DonHangId",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "vaiTro_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "UserRole");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "UserRole");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "UserRole");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "UserRole");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "UserRole");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "UserRole");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "UserRole");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "UserRole");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "UserRole");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "tienDoHocTaps");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "thongBaos");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "thanhToans");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "thanhToans");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "thanhToans");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "thanhToans");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "thanhToans");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "thanhToans");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "thanhToans");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "thanhToans");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "thanhToans");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "taiLieus");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Role");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "Role");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "Role");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "Role");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "Role");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Role");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Role");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "Role");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "Role");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "phans");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "nganHangs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "loaiThongBaos");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "loaiThongBaos");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "loaiThongBaos");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "loaiThongBaos");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "loaiThongBaos");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "loaiThongBaos");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "loaiThongBaos");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "loaiThongBaos");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "loaiThongBaos");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "lienKets");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "lienKets");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "lienKets");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "lienKets");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "lienKets");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "lienKets");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "lienKets");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "lienKets");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "lienKets");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "lanLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "lanLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "lanLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "lanLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "lanLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "lanLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "lanLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "lanLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "lanLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "khuyenMais");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "khuyenMais");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "khuyenMais");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "khuyenMais");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "khuyenMais");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "khuyenMais");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "khuyenMais");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "khuyenMais");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "khuyenMais");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "khuyenMai_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "khuyenMai_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "khuyenMai_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "khuyenMai_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "khuyenMai_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "khuyenMai_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "khuyenMai_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "khuyenMai_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "khuyenMai_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "KhoaHoc");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "ketQuaBaiThis");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "ketQuaBaiThis");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "ketQuaBaiThis");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "ketQuaBaiThis");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "ketQuaBaiThis");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "ketQuaBaiThis");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "ketQuaBaiThis");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "ketQuaBaiThis");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "ketQuaBaiThis");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "hoiDaps");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "gioHangs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "gioHangs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "gioHangs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "gioHangs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "gioHangs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "gioHangs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "gioHangs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "gioHangs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "gioHangs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "gioHangChiTiets");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "donHangs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "donHangs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "donHangs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "donHangs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "donHangs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "donHangs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "donHangs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "donHangs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "donHangs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "DonHangId",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "donHangChiTiets");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "dapAns");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "dapAn_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "dapAn_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "dapAn_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "dapAn_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "dapAn_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "dapAn_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "dapAn_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "dapAn_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "dapAn_NguoiDungs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "danhSachYeuThiches");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "danhSachYeuThiches");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "danhSachYeuThiches");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "danhSachYeuThiches");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "danhSachYeuThiches");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "danhSachYeuThiches");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "danhSachYeuThiches");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "danhSachYeuThiches");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "danhSachYeuThiches");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "danhMucs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "danhMucs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "danhMucs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "danhMucs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "danhMucs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "danhMucs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "danhMucs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "danhMucs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "danhMucs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "danhMuc_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "danhMuc_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "danhMuc_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "danhMuc_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "danhMuc_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "danhMuc_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "danhMuc_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "danhMuc_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "danhMuc_KhoaHocs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "danhGias");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "dangKyKhoaHocs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "dangKyKhoaHocs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "dangKyKhoaHocs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "dangKyKhoaHocs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "dangKyKhoaHocs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "dangKyKhoaHocs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "dangKyKhoaHocs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "dangKyKhoaHocs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "dangKyKhoaHocs");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "chungChis");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "chungChis");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "chungChis");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "chungChis");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "chungChis");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "chungChis");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "chungChis");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "chungChis");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "chungChis");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "chiTietLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "chiTietLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "chiTietLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "chiTietLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "chiTietLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "chiTietLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "chiTietLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "chiTietLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "chiTietLamBaiKiemTras");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "cauHois");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "baiKiemTras");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "CreatedDate",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "CreatedId",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "DeletedDate",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "DeletedId",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "UpdatedDate",
                table: "baiGiangs");

            migrationBuilder.DropColumn(
                name: "UpdatedId",
                table: "baiGiangs");

            migrationBuilder.AlterColumn<bool>(
                name: "TrangThai",
                table: "tienDoHocTaps",
                type: "bit",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrangThai",
                table: "thongBaos",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "SoTien",
                table: "thanhToans",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrangThai",
                table: "taiLieus",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrangThai",
                table: "nganHangs",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrangThai",
                table: "lienKets",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MaGiamGia",
                table: "khuyenMais",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrangThaiPheDuyet",
                table: "KhoaHoc",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrangThai",
                table: "KhoaHoc",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Diem",
                table: "ketQuaBaiThis",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "SoTienThanhToan",
                table: "donHangs",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "SoTienGiamGia",
                table: "donHangs",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "GiaLucDat",
                table: "donHangChiTiets",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "DiemDatDuoc",
                table: "dapAn_NguoiDungs",
                type: "bit",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "TrangThai",
                table: "danhMucs",
                type: "bit",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrangThai",
                table: "danhGias",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "TrangThai",
                table: "dangKyKhoaHocs",
                type: "bit",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "GiaDangKy",
                table: "dangKyKhoaHocs",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrangThai",
                table: "chungChis",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<bool>(
                name: "TrangThai",
                table: "baiKiemTras",
                type: "bit",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "TrangThai",
                table: "baiGiangs",
                type: "int",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "AuditableEntities",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    DeletedDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    UpdatedBy = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedId = table.Column<Guid>(type: "uniqueidentifier", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditableEntities", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "f77f8573-df9e-44c9-9240-c2e710433ba2", "AQAAAAIAAYagAAAAEKJ9KAQUjI8RxQpftJizOesEXYp6DUs+F0oFcstBoVKNANIOPeBu4pYaumV2hoQ53w==", "0d4c674d-4cf0-42b0-bf3d-f063bb04b405" });

            migrationBuilder.AddForeignKey(
                name: "FK_Role_AuditableEntities_Id",
                table: "Role",
                column: "Id",
                principalTable: "AuditableEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_taiLieus_AuditableEntities_Id",
                table: "taiLieus",
                column: "Id",
                principalTable: "AuditableEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_thanhToans_AuditableEntities_Id",
                table: "thanhToans",
                column: "Id",
                principalTable: "AuditableEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_thongBaos_AuditableEntities_Id",
                table: "thongBaos",
                column: "Id",
                principalTable: "AuditableEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_tienDoHocTaps_AuditableEntities_Id",
                table: "tienDoHocTaps",
                column: "Id",
                principalTable: "AuditableEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRole_AuditableEntities_Id",
                table: "UserRole",
                column: "Id",
                principalTable: "AuditableEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_vaiTro_NguoiDungs_AuditableEntities_Id",
                table: "vaiTro_NguoiDungs",
                column: "Id",
                principalTable: "AuditableEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
