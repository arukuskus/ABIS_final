using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ABIS.Data.Migrations
{
    /// <summary>
    /// Мигразия для экземпляров
    /// </summary>
    public partial class Instances : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
insert into instances (id, receipt_name, info) values ('ac48f566-913c-4e59-89d8-40a4dd7dd096', 'Первое', 'Ничего интереcного_2');
insert into instances (Id, receipt_name, info) values ('0bdf0e68-fcbb-44e1-be3a-e9e412f0df70', 'Второе', 'Ничего интересного');
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
delete from instances where id in ('ac48f566-913c-4e59-89d8-40a4dd7dd096', '0bdf0e68-fcbb-44e1-be3a-e9e412f0df70');
");
        }
    }
}
