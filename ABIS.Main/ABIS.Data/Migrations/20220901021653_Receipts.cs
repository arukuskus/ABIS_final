using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABIS.Data.Migrations
{
    /// <summary>
    /// Миграция для поступлений книг
    /// </summary>
    public partial class Receipts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
insert into receipts (id, name, created_date, instance_id) values ('e4753723-9235-4b74-b1e3-21ca6e7cc751', 'Первое', '2022-08-31', 'ac48f566-913c-4e59-89d8-40a4dd7dd096');
insert into receipts (id, name, created_date, instance_id) values ('811098ab-7f27-4481-b3c9-07b245156de4', 'Второе', '2022-08-31', '0bdf0e68-fcbb-44e1-be3a-e9e412f0df70');
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
delete from receipts where id in ('e4753723-9235-4b74-b1e3-21ca6e7cc751', '811098ab-7f27-4481-b3c9-07b245156de4');
");
        }
    }
}
