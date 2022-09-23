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
            var reciepts = await _aBISContext.Receipts.Select(x => new ReceiptView()
            {
                Id = x.Id,
                CreatedDate = x.CreatedDate,
                Name = x.Name
            }).ToListAsync(cancellationToken);

            return reciepts;
        }

        /// <summary>
        /// Получить поступлеие по id c полной информацией (изданиями и файлами)
        /// </summary>
        [HttpGet]
        [Route("receipt")]
        public async Task<ReceiptWithFullInfo> GetReceiptFromId(Guid id, CancellationToken cancellationToken)
        {
            var result = await _aBISContext.Receipts.Include(x => x.Instances).Include(x => x.Files).Select(x => new ReceiptWithFullInfo()
            {
                Id = x.Id,
                CreatedDate = x.CreatedDate,
                Name = x.Name,
                Instances = x.Instances.Select(i => new InstanceView
                {
                    Id = i.Id,
                    Info = i.Info,
                    RecieptId = i.RecieptId
                }).ToList(),
                Files = x.Files.Select(f => new FilesForReceiptsView()
                {
                    Id=f.Id,
                    Name=f.Name,
                    CreatedDate=f.CreatedDate,
                    Size = f.Size,
                    FileName = f.FileName
                }).ToList()
            }).Where(x => x.Id == id).SingleOrDefaultAsync(cancellationToken);

            if (result == null)
            {
                throw new Exception("такого поступления не существует");
            }

            return result;
        }

        /// <summary>
        /// Изменяет данные в выбранном поступлении и возвращает результат завершения операции (успешно/неуспешно)
        /// </summary>
        [HttpPost]
        [Route("save/receipt")]
        public async Task<bool> SaveReceipt([FromBody] ReceiptWithFullInfo newReceipt, CancellationToken cancellationToken)
        {
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

                

                if(newReceipt.Instances != null)
                {
                    // Издания, которые относятся к поступлению
                    var dbInstances = await _aBISContext.Instances.Where(x => x.RecieptId == newReceipt.Id).ToListAsync(cancellationToken);
                    // Список изданий на удаление
                    var toDeleteFromDbInstances = dbInstances.ToList();

                    foreach (var vmInstance in newReceipt.Instances)
                    {
                        // Прилетевшее издание есть в бд?
                        var dbInstane = dbInstances.SingleOrDefault(s => s.Id == vmInstance.Id);

                        if (dbInstane is null)
                        {
                            // Такого издания нет в бд - добвим новое издание в бд
                            _aBISContext.Instances.Add(new Instance()
                            {
                                Id = new Guid(),
                                Info = vmInstance.Info,
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
                }
               
                if(newReceipt.Files != null)
                {
                    // Файлы, которые относятся к поступлению
                    var dbFiles = await _aBISContext.FilesForReceipts.Where(x => x.RecieptId == newReceipt.Id).ToListAsync(cancellationToken);
                    // Список файлов на удаление
                    var toDeleteFromDbFiles = dbFiles.ToList();

                    foreach (var vmFile in newReceipt.Files)
                    {
                        // прилетевший файл есть в бд (файлы-поступления)?
                        var dbFile = dbFiles.SingleOrDefault(s => s.Id == vmFile.Id);
                        // я бы сделала поиск файла в фактическом хранилище для достоверности
                        var storeFile = _aBISContext.Files.Where(x => x.Id == vmFile.Id).SingleOrDefaultAsync(cancellationToken).Result;

                        if (dbFile is null && storeFile is not null)
                        {
                            // такого файла нет в бд (файлы-поступления), добавим файл в эту бд
                            _aBISContext.FilesForReceipts.Add(new FilesForReceipts()
                            {
                                Id = vmFile.Id,
                                Name = vmFile.Name,
                                CreatedDate = vmFile.CreatedDate,
                                Size = storeFile.Size,
                                FileName = storeFile.Name,
                                RecieptId = newReceipt.Id
                            });

                        }
                        else if (dbFile is not null && storeFile is not null)
                        {
                            // Тогда пришедший файл уже есть в бд (файлы-поступления)
                            // уберем его из списка на удаление
                            toDeleteFromDbFiles.Remove(dbFile);

                            // Обновим для него информацию
                            dbFile.Name = vmFile.Name; // название файла, которое ввел пользователь
                            dbFile.CreatedDate = vmFile.CreatedDate;
                            dbFile.Size = storeFile.Size;
                            dbFile.FileName = storeFile.Name; //не уверенна что фактическое имя нужно обновлять
                        }
                        else
                        {
                            // по идее такого не может быть чтобы файла не было в хранилище,
                            // поэтому не придумала что делать в таком случае (лишнее?)
                        }
                    }


                    // Удалим из бд (файлы-поступления) файлы, которые были в бд, но не пришли с новым спискои извне
                    _aBISContext.FilesForReceipts.RemoveRange(toDeleteFromDbFiles);
                }

                await _aBISContext.SaveChangesAsync(cancellationToken);
                await dbContextTransaction.CommitAsync(cancellationToken);

                return true;
            }
        }

        /// <summary>
        /// Добавляет новое поступление и возвращаем результат выполнения операции (успешно/неуспешно)
        /// </summary>
        [HttpPost]
        [Route("add/receipt")]
        public async Task<bool> AddNewReceipt([FromBody] ReceiptWithFullInfo newReceipt, CancellationToken cancellationToken)
        {

            // это вместо валидации параметров
            if (newReceipt == null)
            {
                throw new Exception("пустой запрос");
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

                if(newReceipt.Instances != null && newReceipt.Instances.Count != 0)
                {
                    // Сохраняем издания в бд
                    foreach (var newInstance in newReceipt.Instances)
                    {
                        // Перед добавлением издания нужно сделать проверку
                        if (newInstance.Info != null)
                        {
                            _aBISContext.Instances.Add(new Instance()
                            {
                                Id = new Guid(),
                                Info = newInstance.Info,
                                RecieptId = bdReceipt.Id
                            });
                        }
                    }
                }
                
                if(newReceipt.Files != null && newReceipt.Files.Count != 0)
                {
                    // Сохраняем файлы в бд (файлы-поступления)
                    foreach (var newFile in newReceipt.Files)
                    {
                        // Ищем файл в хранилище
                        var storeFile = _aBISContext.Files.Where(x => x.Id == newFile.Id).SingleOrDefaultAsync(cancellationToken).Result;
                        if (storeFile is not null)
                        {
                            // Проверяем на корректность инфо, которое внес ползователь
                            if (!String.IsNullOrEmpty(newFile.Name))
                            {
                                _aBISContext.FilesForReceipts.Add(new FilesForReceipts()
                                {
                                    Id = newFile.Id,
                                    Name = newFile.Name,
                                    CreatedDate = newFile.CreatedDate,
                                    Size = storeFile.Size,
                                    FileName = storeFile.Name,
                                    RecieptId = bdReceipt.Id
                                });
                            }
                        }
                    }
                }

                await _aBISContext.SaveChangesAsync(cancellationToken);
                await dbContextTransaction.CommitAsync(cancellationToken);

                return true;
            }
        }
    }
}
