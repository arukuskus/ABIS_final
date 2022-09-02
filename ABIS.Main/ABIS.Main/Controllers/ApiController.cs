using ABIS.Data.Models;
using ABIS.Main.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABIS.Main.Controllers
{

    /// <summary>
    /// Тестовый контроллер для обработки post и get запроса
    /// </summary>
    [ApiController]
    [Route("api")]
    public class ApiController : ControllerBase
    {
        private readonly ABISContext _aBISContext;

        /// <summary>
        /// Внедрение зависимостей
        /// </summary>
        public ApiController(ABISContext aBISContext)
        {
            _aBISContext = aBISContext; // инджектируем контекст БД
        }

        /// <summary>
        /// Просмотреть все поступления
        /// </summary>
        [HttpGet]
        [Route("receipts")]
        public List<ReceiptView> GetInstances()
        {
            var receipts = new List<ReceiptView>(); // Список поступлений

            foreach (var receipt in _aBISContext.Receipts)
            {
                receipts.Add(new ReceiptView
                {
                    Id = receipt.Id,
                    Name = receipt.Name,
                    CreatedDate = receipt.CreatedDate
                });
            }

            return receipts;
        }

        /// <summary>
        /// Добавление новой книги
        /// </summary>
        [HttpPost]
        [Route("add_instance")]
        public async Task<Models.EmptyResult> AddNewInstance([FromBody] InstanceView instance)
        {

            if (instance.Info == null || instance.ReceiptName == null)
            {
                throw new Exception("Вы пытаетесь добавить пустой экземпляр");
            }

            // Открываем ранзакцию
            using (var context = _aBISContext.Database.BeginTransaction())
            {
                // Лезем в бд и смотрим что такой книги нет
                var book = await(from i in _aBISContext.Instances
                                 where i.ReceiptName == instance.ReceiptName
                                 && i.Info == instance.Info
                                 select i).SingleOrDefaultAsync();

                if (book != null)
                {
                    throw new Exception("Такой экземпляр уже есть");
                }

                // Проверяем что поступление существует в бд
                var receipt = await(from r in _aBISContext.Receipts
                                    where r.Name == instance.ReceiptName
                                    select r).SingleOrDefaultAsync();
                if(receipt == null)
                {
                    throw new Exception("Такого поступления не существует, пожалуйста выберете существующее поступление!");
                }

                _aBISContext.Instances.Add(new Instance
                {
                    Id = Guid.NewGuid(),
                    ReceiptName = instance.ReceiptName,
                    Info = instance.Info
                });

                // Сохраним изменения  бд
                await _aBISContext.SaveChangesAsync();
                await context.CommitAsync(); // Еще выведем комментарии

                return new Models.EmptyResult();
            }
        }
    }
}
