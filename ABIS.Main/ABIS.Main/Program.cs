using ABIS.Data.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Add services to the container.
var services = builder.Services;

services.AddMvcCore()
    .AddApiExplorer();

//services.AddControllers(); // Вроде новее чем AddMvc

services.AddDbContext<ABISContext>(options => { options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")); }); // Определяем контекст БД

// Добавление swagger
services.AddSwaggerGen();
services.AddCors();

var app = builder.Build();

// Если в режиме разработки - использовать Swagger
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseCors(b=> b.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

app.UseStaticFiles();   // Добавляем поддержку статических файлов
app.UseRouting(); // Подключаем роутиенг (находит конечную точку)

// Здесь будет место для аутентификации и авторизации

// Добавляем конечные точки (выполняет конечную точку)
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller}/{action=Index}/{id?}");


    endpoints.MapFallbackToFile("index.html");
});

app.Run();
