using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace smaller.Migrations
{
    /// <inheritdoc />
    public partial class AddPhase2And3Features : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiresAtUtc",
                table: "ShortenedUrls",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "ShortenedUrls",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsCustom",
                table: "ShortenedUrls",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxClicks",
                table: "ShortenedUrls",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Browser",
                table: "AccessLogs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DeviceType",
                table: "AccessLogs",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OperatingSystem",
                table: "AccessLogs",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExpiresAtUtc",
                table: "ShortenedUrls");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "ShortenedUrls");

            migrationBuilder.DropColumn(
                name: "IsCustom",
                table: "ShortenedUrls");

            migrationBuilder.DropColumn(
                name: "MaxClicks",
                table: "ShortenedUrls");

            migrationBuilder.DropColumn(
                name: "Browser",
                table: "AccessLogs");

            migrationBuilder.DropColumn(
                name: "DeviceType",
                table: "AccessLogs");

            migrationBuilder.DropColumn(
                name: "OperatingSystem",
                table: "AccessLogs");
        }
    }
}
