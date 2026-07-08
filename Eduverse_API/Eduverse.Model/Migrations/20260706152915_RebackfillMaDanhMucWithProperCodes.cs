using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class RebackfillMaDanhMucWithProperCodes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Map known categories to specific codes
            migrationBuilder.Sql(@"
                UPDATE danhMucs SET MaDanhMuc = 'IT001' WHERE TenDanhMuc = N'Công nghệ thông tin' AND IsDeleted = 0;
                UPDATE danhMucs SET MaDanhMuc = 'AI001' WHERE TenDanhMuc = N'Trí tuệ nhân tạo' AND IsDeleted = 0;
                UPDATE danhMucs SET MaDanhMuc = 'DS001' WHERE TenDanhMuc = N'Khoa học dữ liệu' AND IsDeleted = 0;
                UPDATE danhMucs SET MaDanhMuc = 'MK001' WHERE TenDanhMuc = N'Marketing' AND IsDeleted = 0;
                UPDATE danhMucs SET MaDanhMuc = 'DE001' WHERE TenDanhMuc = N'Thiết kế' AND IsDeleted = 0;
            ");

            // Step 2: Assign DM001, DM002... to remaining categories that don't have a proper code yet
            migrationBuilder.Sql(@"
                ;WITH RemainingCats AS (
                    SELECT Id, MaDanhMuc,
                           ROW_NUMBER() OVER (ORDER BY ISNULL(NgayTao, '9999-12-31'), Id) AS RowNum
                    FROM danhMucs
                    WHERE IsDeleted = 0
                      AND (MaDanhMuc IS NULL 
                           OR MaDanhMuc = '' 
                           OR MaDanhMuc NOT LIKE '[A-Z][A-Z]%[0-9][0-9][0-9]')
                )
                UPDATE RemainingCats 
                SET MaDanhMuc = 'DM' + RIGHT('000' + CAST(RowNum AS VARCHAR(3)), 3);
            ");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "4f8c3c5b-a80c-46fe-9a9c-cbbec6782eba", "AQAAAAIAAYagAAAAEB0liY1ZzD7wBVLwB+HJh3N6bErpYDEBD2u5WIGh/vBKzAg7e1lOfk8SdJPHeQkQag==", "750a5333-7bb5-404c-b8a3-7f83e7e1699d" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "ba7cf24f-197e-4c53-a572-f8cd983ae748", "AQAAAAIAAYagAAAAEIh6Oi/SRWVPifa0Bu1Tgt/FY82mObHSuM3ftEjGLtPXb/qk72SLhD1496wjzWXJbA==", "4caf80f1-a69e-4fdd-a7bb-ff52bd5762b9" });
        }
    }
}
