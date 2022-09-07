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
        public List<ReceiptView> GetReceipts()
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
        /// Получить поступлеие по id (вместе с экземплярами книг)
        /// </summary>
        [HttpGet]
        [Route("receipt")]
        public async Task<ReceiptFromIdResult> GetReceiptFromId(Guid id)
        {

            // список книг
            var instances = new List<InstanceView>();
            // поступление
            var receipt = await (from r in _aBISContext.Receipts
                                 where r.Id == id
                                 select r).SingleOrDefaultAsync();

            if (receipt == null)
            {
                throw new Exception("такого поступления не существует");
            }

            // Обрабатываем все книги, которые есть в этом поступлении
            foreach (var i in _aBISContext.Instances)
            {
                if (i.ReceiptName == receipt.Name)
                {
                    instances.Add(new InstanceView
                    {
                        Id = i.Id,
                        ReceiptName = i.ReceiptName,
                        Info = i.Info,
                    });
                }
            }

            // Результат
            var result = new ReceiptFromIdResult
            {
                Id = receipt.Id,
                CreatedDate = receipt.CreatedDate,
                Name = receipt.Name,
                Instances = new List<InstanceView>(instances)
            };

            return result;

        }

        /// <summary>
        /// Посмотреть все экземпляры
        /// </summary>
        [HttpGet]
        [Route("instances")]
        public List<InstanceView> GetInstances()
        {
            var instances = new List<InstanceView>();

            foreach(var instance in _aBISContext.Instances)
            {
                instances.Add(new InstanceView
                {
                    Id = instance.Id,
                    ReceiptName = instance.ReceiptName,
                    Info = instance.Info
                });
            }

            return instances;
        }

        /// <summary>
        /// Добавление новой книги
        /// </summary>
        [HttpPost]
        [Route("add_instance")]
        public async Task<bool> AddNewInstance([FromBody] InstanceView instance)
        {

            if (instance.Info == null || instance.ReceiptName == null)
            {
                //throw new Exception("Вы пытаетесь добавить пустой экземпляр");
                return false;
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
                    //throw new Exception("Такой экземпляр уже есть");
                    return false;
                }

                // Проверяем что поступление существует в бд
                var receipt = await(from r in _aBISContext.Receipts
                                    where r.Name == instance.ReceiptName
                                    select r).SingleOrDefaultAsync();
                if(receipt == null)
                {
                    // throw new Exception("Такого поступления не существует, пожалуйста выберете существующее поступление!");
                    return false;
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

                return true;
            }
        }
    }
}
