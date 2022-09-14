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

        public ApiController(ABISContext aBISContext)
        {
            _aBISContext = aBISContext; // инджектируем контекст БД
        }

        /// <summary>
        /// Получить все поступления
        /// </summary>
        [HttpGet]
        [Route("receipts")]
        public async Task<List<ReceiptView>> GetReceipts(CancellationToken cancellationToken)
        {
            var instancesResult = new List<InstanceView>(); // список книг
            var reciepts = await _aBISContext.Receipts.Select(x => new ReceiptView()
            {
                Id = x.Id,
                CreatedDate = x.CreatedDate,
                Name = x.Name
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
        /// Изменяет данные в выбранном поступлении и возвращает копию этого объекта
        /// </summary>
        [HttpPost]
        [Route("save/receipt")]
        public async Task<bool> SaveReceipt([FromBody] ReceiptWithInstancesView newReceipt, CancellationToken cancellationToken)
        {
            // это вместо валидации параметров
            if (newReceipt == null)
            {
                throw new Exception("хотите передать в sql что - то нехорошее");
            }

            using (var dbContextTransaction = _aBISContext.Database.BeginTransaction())
            {
                // Поступление, которое будем обновлять
                var receipt = await (from i in _aBISContext.Receipts
                                      where i.Id == newReceipt.Id
                                      select i).SingleOrDefaultAsync(cancellationToken);

                // Если такого поступления нет, то возвращаем ошибку
                if (receipt == null)
                {
                    //throw new Exception("раз такого издания нет, то и обновлять нечего");
                    return false;
                }

                // Сохраним информацию о поступлении
                receipt.Name = newReceipt.Name;
                receipt.CreatedDate = newReceipt.CreatedDate;

                // Издания, которые относятся к поступлению
                var dbInstances = await _aBISContext.Instances.Where(x=> x.RecieptId == newReceipt.Id).ToListAsync(cancellationToken);

                // Список изданий на удаление
                var toDeleteFromDbInstances = dbInstances.ToList();

                foreach(var vmInstance in newReceipt.Instances)
                {
                    // Прилетевшее издание есть в бд?
                    var dbInstane = dbInstances.SingleOrDefault(s => s.Id == vmInstance.Id);

                   if (dbInstane is null) {
                        // такого издания нет в бд - добвим новое издание ы бд
                        _aBISContext.Instances.Add(new Instance()
                        {
                            Id = new Guid(),
                            Info = vmInstance.Info,
                            ReceiptName = receipt.Name,
                            RecieptId = receipt.Id
                        });

                    }
                    else
                    {
                        // такое издание есть в бд - уберем его из списка на удаление
                        toDeleteFromDbInstances.Remove(dbInstane);
                        // обновим о нем информацию
                        dbInstane.Info = vmInstance.Info;
                        
                    }
                }
                // Удалим из бд издания, которые были в бд, но не пришли с новым списком извне
                _aBISContext.Instances.RemoveRange(toDeleteFromDbInstances);

                await _aBISContext.SaveChangesAsync(cancellationToken);
                await dbContextTransaction.CommitAsync(cancellationToken);

                return true;
            }
        }

        /// <summary>
        /// Добавляет новое поступление
        /// </summary>
        [HttpPost]
        [Route("add/receipt")]
        public async Task<bool> AddNewReceipt([FromBody] ReceiptWithInstancesView newReceipt, CancellationToken cancellationToken)
        {

            // это вместо валидации параметров
            if (newReceipt == null)
            {
                throw new Exception("пустой запрос");
            }

            if(newReceipt.Instances == null)
            {
                throw new Exception("издания должны передаваться вместе с поступлением");
            }

            using (var dbContextTransaction = _aBISContext.Database.BeginTransaction())
            {
                var receipt = await (from i in _aBISContext.Receipts
                                     where i.Name == newReceipt.Name
                                     select i).SingleOrDefaultAsync(cancellationToken);

                // Если такое поступление есть
                if (receipt != null)
                {
                    return false;
                    //throw new Exception("такое поступление есть в бд");
                }

                // Сохраним поступление в бд
                var bdReceipt = new Receipt()
                {
                    Id = new Guid(),
                    CreatedDate = newReceipt.CreatedDate,
                    Name = newReceipt.Name
                };
                _aBISContext.Receipts.Add(bdReceipt);

                foreach(var newInstance in newReceipt.Instances)
                {
                    _aBISContext.Instances.Add(new Instance()
                    {
                        Id = new Guid(),
                        Info = newInstance.Info,
                        ReceiptName = bdReceipt.Name,
                        RecieptId = bdReceipt.Id
                    });
                }

                await _aBISContext.SaveChangesAsync(cancellationToken);
                await dbContextTransaction.CommitAsync(cancellationToken);

                return true;
            }
        }
    }
}
