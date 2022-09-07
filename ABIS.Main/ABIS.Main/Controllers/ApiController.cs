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
        /// Получить все поступления
        /// </summary>
        [HttpGet]
        [Route("receipts")]
        public async Task<List<ReceiptWithInstancesView>> GetReceipts(CancellationToken cancellationToken)
        {
            var instancesResult = new List<InstanceView>(); // список книг
            var reciepts = await _aBISContext.Receipts.Include(x => x.Instances).Select(x => new ReceiptWithInstancesView()
            {
                Id = x.Id,
                CreatedDate = x.CreatedDate,
                Name = x.Name,
                Instances = x.Instances.Select(i => new InstanceView
                {
                    Id = i.Id,
                    Info = i.Info,
                    ReceiptName = i.ReceiptName,
                    RecieptId = i.RecieptId
                }).ToList()
            }).ToListAsync(cancellationToken);

            return reciepts;
        }

        /// <summary>
        /// Получить поступлеие по id
        /// </summary>
        [HttpGet]
        [Route("receipt")]
        public async Task<ReceiptWithInstancesView> GetReceiptFromId(Guid id, CancellationToken cancellationToken)
        {

            // список книг
            var instances = new List<InstanceView>();
            var result = await _aBISContext.Receipts.Include(x => x.Instances).Select(x => new ReceiptWithInstancesView()
            {
                Id = x.Id,
                CreatedDate = x.CreatedDate,
                Name = x.Name,
                Instances = x.Instances.Select(i => new InstanceView
                {
                    Id = i.Id,
                    Info = i.Info,
                    ReceiptName = i.ReceiptName,
                    RecieptId = i.RecieptId
                }).ToList()
            }).Where(x => x.Id == id).SingleOrDefaultAsync(cancellationToken);

            // поступление
            //var receipt = await (from r in _aBISContext.Receipts
            //                     where r.Id == id
            //                     select r).SingleOrDefaultAsync(cancellationToken);

            if (result == null)
            {
                throw new Exception("такого поступления не существует");
            }

            // Обрабатываем все книги, которые есть в этом поступлении
            //foreach (var i in _aBISContext.Instances)
            //{
            //    if (i.ReceiptName == receipt.Name)
            //    {
            //        instances.Add(new InstanceView
            //        {
            //            Id = i.Id,
            //            ReceiptName = i.ReceiptName,
            //            Info = i.Info,
            //        });
            //    }
            //}

            //// Результат
            //var result = new ReceiptWithInstancesView
            //{
            //    Id = receipt.Id,
            //    CreatedDate = receipt.CreatedDate,
            //    Name = receipt.Name,
            //    Instances = new List<InstanceView>(instances)
            //};

            return result;

        }

        /// <summary>
        /// Посмотреть все экземпляры
        /// </summary>
        [HttpGet]
        [Route("instances")]
        public async Task<List<InstanceView>> GetInstances(CancellationToken cancellationToken)
        {
            var instances = new List<InstanceView>();

            var result = await _aBISContext.Instances.Select(x => new InstanceView()
            {
                Id = x.Id,
                ReceiptName = x.ReceiptName,
                Info = x.Info,
                RecieptId = x.RecieptId
            }).ToListAsync(cancellationToken);

            //foreach(var instance in _aBISContext.Instances)
            //{
            //    instances.Add(new InstanceView
            //    {
            //        Id = instance.Id,
            //        ReceiptName = instance.ReceiptName,
            //        Info = instance.Info
            //    });
            //}

            return result;
        }

        /// <summary>
        /// Добавление новой книги
        /// </summary>
        [HttpPost]
        [Route("add_instance")]
        public async Task<bool> AddNewInstance([FromBody] InstanceView instance, CancellationToken cancellationToken)
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
                                 select i).SingleOrDefaultAsync(cancellationToken);

                if (book != null)
                {
                    //throw new Exception("Такой экземпляр уже есть");
                    return false;
                }

                // Проверяем что поступление существует в бд
                var receipt = await(from r in _aBISContext.Receipts
                                    where r.Name == instance.ReceiptName
                                    select r).SingleOrDefaultAsync(cancellationToken);
                if(receipt == null)
                {
                    // throw new Exception("Такого поступления не существует, пожалуйста выберете существующее поступление!");
                    return false;
                }

                _aBISContext.Instances.Add(new Instance
                {
                    Id = Guid.NewGuid(),
                    ReceiptName = instance.ReceiptName,
                    Info = instance.Info,
                    RecieptId = receipt.Id
                });

                // Сохраним изменения  бд
                await _aBISContext.SaveChangesAsync(cancellationToken);
                await context.CommitAsync(); // Еще выведем комментарии

                return true;
            }
        }
    }
}
