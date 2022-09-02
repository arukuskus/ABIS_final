using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABIS.Data.Migrations
{
    public partial class initialize : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "instances",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    receipt_name = table.Column<string>(type: "text", nullable: false, comment: "в каком поступлении пришел этот экземпляр"),
                    info = table.Column<string>(type: "text", nullable: false, comment: "какая - то информация о книге")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_instances", x => x.id);
                },
                comment: "таблица экземпляров книг");

            migrationBuilder.CreateTable(
                name: "receipts",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false, comment: "наименование поступления"),
                    created_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, comment: "дата создания поступления"),
                    instance_id = table.Column<Guid>(type: "uuid", nullable: true, comment: "индекс экземпляра, внесенного в это поступление")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_receipts", x => x.id);
                    table.ForeignKey(
                        name: "FK_receipts_instances_instance_id",
                        column: x => x.instance_id,
                        principalTable: "instances",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                },
                comment: "таблица поступлений");

            migrationBuilder.CreateIndex(
                name: "IX_receipts_instance_id",
                table: "receipts",
                column: "instance_id");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "receipts");

            migrationBuilder.DropTable(
                name: "instances");
        }
    }
}
