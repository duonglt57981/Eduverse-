using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Eduverse.Model.Migrations
{
    /// <inheritdoc />
    public partial class AddBangCapAndCvUrlToInstructorRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BangCap",
                table: "InstructorRequests",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CvUrl",
                table: "InstructorRequests",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "dfcbe57a-aede-468a-b321-4ec60cec35e8", "AQAAAAIAAYagAAAAEG/tgIsmgjgZxb4pATZjKbLvxpefs1BCGIH3BWskgDQZL0TMf8OFt5CFUrnC+Ptsaw==", "2ca2957e-1954-4818-b68d-ad77dbc6026e" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BangCap",
                table: "InstructorRequests");

            migrationBuilder.DropColumn(
                name: "CvUrl",
                table: "InstructorRequests");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"),
                columns: new[] { "ConcurrencyStamp", "PasswordHash", "SecurityStamp" },
                values: new object[] { "627513c9-2ae8-47ec-a5a2-57640f96c8f8", "AQAAAAIAAYagAAAAEEMUlhUXpFo7t2JMiFIkSL0fbAJlT3Z2uKFBRBiFCKcsZhpheTVdG/Vo+YhQORwgug==", "86775bfb-189d-4ecc-a663-51fc6000b2e6" });
        }
    }
}
