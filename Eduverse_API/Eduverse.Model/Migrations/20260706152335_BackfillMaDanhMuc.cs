using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class BackfillMaDanhMuc : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE danhMucs
                SET MaDanhMuc = UPPER(
                    CASE 
                        WHEN TenDanhMuc IS NULL OR LTRIM(RTRIM(TenDanhMuc)) = '' THEN ''
                        WHEN CHARINDEX(' ', LTRIM(TenDanhMuc)) > 0 THEN 
                            SUBSTRING(LTRIM(TenDanhMuc), 1, 1) + 
                            SUBSTRING(SUBSTRING(LTRIM(TenDanhMuc), CHARINDEX(' ', LTRIM(TenDanhMuc)) + 1, LEN(TenDanhMuc)), 1, 1)
                        ELSE 
                            CASE WHEN LEN(TenDanhMuc) >= 2 THEN SUBSTRING(TenDanhMuc, 1, 2) ELSE TenDanhMuc END
                    END
                )
                WHERE MaDanhMuc IS NULL OR MaDanhMuc = '';
            ");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "ba7cf24f-197e-4c53-a572-f8cd983ae748", "AQAAAAIAAYagAAAAEIh6Oi/SRWVPifa0Bu1Tgt/FY82mObHSuM3ftEjGLtPXb/qk72SLhD1496wjzWXJbA==", "4caf80f1-a69e-4fdd-a7bb-ff52bd5762b9" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "3e1f9cc7-5368-45f4-bf2d-d191a41f406f", "AQAAAAIAAYagAAAAEDSqSNj6pTsM8lQzLUI2foiHG3xtw3x7kTdSDkvVWeKrjmA2gCtnl1oYO+7Z2Sr5Dg==", "b7045cae-1474-42fa-80ce-b9a4fdff4ddd" });
        }
    }
}
