using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABIS.Data.Migrations
{
    public partial class Test2 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Instances_Receipts_ReceiptId",
                table: "Instances");

            migrationBuilder.DropIndex(
                name: "IX_Instances_ReceiptId",
                table: "Instances");

            migrationBuilder.DropColumn(
                name: "ReceiptId",
                table: "Instances");

            migrationBuilder.CreateIndex(
                name: "IX_Instances_RecieptId",
                table: "Instances",
                column: "RecieptId");

            migrationBuilder.AddForeignKey(
                name: "FK_Instances_Receipts_RecieptId",
                table: "Instances",
                column: "RecieptId",
                principalTable: "Receipts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Instances_Receipts_RecieptId",
                table: "Instances");

            migrationBuilder.DropIndex(
                name: "IX_Instances_RecieptId",
                table: "Instances");

            migrationBuilder.AddColumn<Guid>(
                name: "ReceiptId",
                table: "Instances",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Instances_ReceiptId",
                table: "Instances",
                column: "ReceiptId");

            migrationBuilder.AddForeignKey(
                name: "FK_Instances_Receipts_ReceiptId",
                table: "Instances",
                column: "ReceiptId",
                principalTable: "Receipts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
