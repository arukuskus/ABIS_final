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

            if (result == null)
            {
                throw new Exception("такого поступления не существует");
            }

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

            return result;
        }

        /// <summary>
        /// Добавление новой книги
        /// </summary>
        [HttpPost]
        [Route("add/instance")]
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

        /// <summary>
        /// Изменяетданные в выбранном издании и возвращает копию этого объекта
        /// </summary>
        [HttpPost]
        [Route("save/instance")]
        public async Task<InstanceView> SaveInstance([FromBody] InstanceView newInstance, CancellationToken cancellationToken)
        {
            // это вместо валидации параметров
            if(newInstance == null) {
                throw new Exception("хотите передать в sql что - то нехорошее");
            }

            using(var dbContextTransaction = _aBISContext.Database.BeginTransaction())
            {
                var instance = await (from i in _aBISContext.Instances
                                      where i.Id == newInstance.Id
                                      select i).SingleOrDefaultAsync(cancellationToken);
                if (instance == null)
                {
                    throw new Exception("раз такого издания нет, то и обновлять нечего");
                }

                instance.Info = newInstance.Info;

                var result = new InstanceView()
                {
                    Id = instance.Id,
                    Info = instance.Info,
                    ReceiptName = instance.ReceiptName,
                    RecieptId = instance.RecieptId
                };
                await _aBISContext.SaveChangesAsync(cancellationToken);
                await dbContextTransaction.CommitAsync(cancellationToken);

                return result;
            }
        }


        /// <summary>
        /// Изменяет данные в выбранном поступлении и возвращает копию этого объекта
        /// </summary>
        [HttpPost]
        [Route("save/receipt")]
        public async Task<ReceiptView> SaveReceipt([FromBody] ReceiptView newReceipt, CancellationToken cancellationToken)
        {
            // это вместо валидации параметров
            if (newReceipt == null)
            {
                throw new Exception("хотите передать в sql что - то нехорошее");
            }

            using (var dbContextTransaction = _aBISContext.Database.BeginTransaction())
            {
                var receipt = await (from i in _aBISContext.Receipts
                                      where i.Id == newReceipt.Id
                                      select i).SingleOrDefaultAsync(cancellationToken);
                if (receipt == null)
                {
                    throw new Exception("раз такого издания нет, то и обновлять нечего");
                }

                receipt.Name = newReceipt.Name;
                receipt.CreatedDate = newReceipt.CreatedDate;

                var result = new ReceiptView
                {
                    Id = newReceipt.Id,
                    Name = newReceipt.Name,
                    CreatedDate = newReceipt.CreatedDate
                };
                await _aBISContext.SaveChangesAsync(cancellationToken);
                await dbContextTransaction.CommitAsync(cancellationToken);

                return result;
            }
        }
    }
}
