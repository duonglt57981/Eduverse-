using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddEntyGioiThieuTableAppUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "GioiThieu",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "GioiThieu", "PasswordHash", "SecurityStamp" },
                values: new object[] { "998ff4af-ecaf-4ab4-9c10-a69dbfb40b91", null, "AQAAAAIAAYagAAAAEFCIvBN8aSMhi2To7ZeZujUBC18wRBGXq3onCgs75JZMybQsyYqCqnrHqqJHzt+iNw==", "d47336f4-83cc-4d0b-8ef4-bfaf0de422e2" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GioiThieu",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "402b78fb-b009-4455-ace7-f7316beef448", "AQAAAAIAAYagAAAAEBRFwHYW9ZW+zbilgWnHnXU0jXuFER7Y1lj8dY2x2sVAu36lf1hnjQPAi3e80H/8jg==", "c5529cd5-98f2-4c66-a77f-103bda26359b" });
        }
    }
}
