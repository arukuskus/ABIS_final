using ABIS.Data.Models;
using ABIS.Main.Cqrs.Queries;
using ABIS.Main.Models;
using Microsoft.EntityFrameworkCore;
using System.Reflection;
using MediatR;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

// Add services to the container.
var services = builder.Services;

services.AddMvcCore()
    .AddApiExplorer();

// место расположения хранения файлов передается через опции конфигурации
services.Configure<FileOptionsView>(options => configuration.GetSection("FileStore").Bind(options));
services.AddDbContext<ABISContext>(options => { options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")); }); // Определяем контекст БД

// Добавление swagger
services.AddSwaggerGen();

services.AddHttpContextAccessor();
services.AddMediatR(Assembly.GetExecutingAssembly());
services.AddTransient<IGetDownloadFileQueryHandler, GetDownloadFileQueryHandler>();

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
