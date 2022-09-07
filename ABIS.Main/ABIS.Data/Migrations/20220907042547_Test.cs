using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABIS.Data.Migrations
{
    public partial class Test : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_receipts_instances_instance_id",
                table: "receipts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_receipts",
                table: "receipts");

            migrationBuilder.DropIndex(
                name: "IX_receipts_instance_id",
                table: "receipts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_instances",
                table: "instances");

            migrationBuilder.DropColumn(
                name: "instance_id",
                table: "receipts");

            migrationBuilder.RenameTable(
                name: "receipts",
                newName: "Receipts");

            migrationBuilder.RenameTable(
                name: "instances",
                newName: "Instances");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "Receipts",
                newName: "Name");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Receipts",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "created_date",
                table: "Receipts",
                newName: "CreatedDate");

            migrationBuilder.RenameColumn(
                name: "info",
                table: "Instances",
                newName: "Info");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Instances",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "receipt_name",
                table: "Instances",
                newName: "ReceiptName");

            migrationBuilder.AlterTable(
                name: "Receipts",
                oldComment: "таблица поступлений");

            migrationBuilder.AlterTable(
                name: "Instances",
                oldComment: "таблица экземпляров книг");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Receipts",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldComment: "наименование поступления");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedDate",
                table: "Receipts",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldComment: "дата создания поступления");

            migrationBuilder.AlterColumn<string>(
                name: "Info",
                table: "Instances",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldComment: "какая - то информация о книге");

            migrationBuilder.AlterColumn<string>(
                name: "ReceiptName",
                table: "Instances",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text",
                oldComment: "в каком поступлении пришел этот экземпляр");

            migrationBuilder.AddColumn<Guid>(
                name: "ReceiptId",
                table: "Instances",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "RecieptId",
                table: "Instances",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddPrimaryKey(
                name: "PK_Receipts",
                table: "Receipts",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Instances",
                table: "Instances",
                column: "Id");

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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Instances_Receipts_ReceiptId",
                table: "Instances");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Receipts",
                table: "Receipts");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Instances",
                table: "Instances");

            migrationBuilder.DropIndex(
                name: "IX_Instances_ReceiptId",
                table: "Instances");

            migrationBuilder.DropColumn(
                name: "ReceiptId",
                table: "Instances");

            migrationBuilder.DropColumn(
                name: "RecieptId",
                table: "Instances");

            migrationBuilder.RenameTable(
                name: "Receipts",
                newName: "receipts");

            migrationBuilder.RenameTable(
                name: "Instances",
                newName: "instances");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "receipts",
                newName: "name");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "receipts",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "CreatedDate",
                table: "receipts",
                newName: "created_date");

            migrationBuilder.RenameColumn(
                name: "Info",
                table: "instances",
                newName: "info");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "instances",
                newName: "id");

            migrationBuilder.RenameColumn(
                name: "ReceiptName",
                table: "instances",
                newName: "receipt_name");

            migrationBuilder.AlterTable(
                name: "receipts",
                comment: "таблица поступлений");

            migrationBuilder.AlterTable(
                name: "instances",
                comment: "таблица экземпляров книг");

            migrationBuilder.AlterColumn<string>(
                name: "name",
                table: "receipts",
                type: "text",
                nullable: false,
                comment: "наименование поступления",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "created_date",
                table: "receipts",
                type: "timestamp with time zone",
                nullable: false,
                comment: "дата создания поступления",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<Guid>(
                name: "instance_id",
                table: "receipts",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                comment: "индекс экземпляра, внесенного в это поступление");

            migrationBuilder.AlterColumn<string>(
                name: "info",
                table: "instances",
                type: "text",
                nullable: false,
                comment: "какая - то информация о книге",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "receipt_name",
                table: "instances",
                type: "text",
                nullable: false,
                comment: "в каком поступлении пришел этот экземпляр",
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddPrimaryKey(
                name: "PK_receipts",
                table: "receipts",
                column: "id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_instances",
                table: "instances",
                column: "id");

            migrationBuilder.CreateIndex(
                name: "IX_receipts_instance_id",
                table: "receipts",
                column: "instance_id");

            migrationBuilder.AddForeignKey(
                name: "FK_receipts_instances_instance_id",
                table: "receipts",
                column: "instance_id",
                principalTable: "instances",
                principalColumn: "id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
