using ABIS.Data.Models;
using ABIS.Main.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ABIS.Main.Controllers
{
    /// <summary>
    /// Контроллер для обработки файлов
    /// </summary>
    [ApiController]
    [Route("file")]
    public class FileController: ControllerBase
    {
        private readonly ABISContext _aBISContext;
        private readonly IOptions<FileOptionsView> _fileOptions;

        public FileController(
            ABISContext aBISContext,
            IOptions<FileOptionsView> fileOptions)
        {
            _aBISContext = aBISContext;
            _fileOptions = fileOptions;
        }

        /// <summary>
        /// Сохраняет приходящие файлы в локальную папку на компьютере и отдает id файла на фронт
        /// </summary>
        [HttpPost]
        [Route("save/store")]
        public async Task<Guid> SaveFileInStore(IFormFile file, CancellationToken cancellationToken)
        {
            if(file == null) {
                throw new Exception("пришел какой-то нехороший файл"); 
            }

            // Создаем директорию для хранения файлов, если такое нет 
            if (!Directory.Exists(_fileOptions.Value.fileStore))
            {
                Directory.CreateDirectory(_fileOptions.Value.fileStore);
            }

            // Прописываем путь хранения файла
            var filePath = Path.Combine(_fileOptions.Value.fileStore, file.FileName);

            // id файла, который будем возвращать
            Guid id = Guid.NewGuid();

            // если такого файла нет в директории хранения, то сохраняем этот файл
            if (!System.IO.File.Exists(filePath))
            {
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var newFileInDb = new Data.Models.File()
                {
                    Id = new Guid(),
                    Name = file.FileName,
                    Path = filePath,
                    DateTime = DateTime.UtcNow,
                    Size = file.Length,
                    Mime = file.ContentType,
                    NameInFileSystem = "",
                    Author = ""
                };
                _aBISContext.Files.Add(newFileInDb);
                await _aBISContext.SaveChangesAsync(cancellationToken);

                id = newFileInDb.Id;
            }
            else
            {
                // тут будем вытаскивать id из бд, если файл существует
                var fileInDb = await (from f in _aBISContext.Files
                                      where f.Name == file.FileName
                                      select f).SingleOrDefaultAsync(cancellationToken);

                if(fileInDb == null) { throw new Exception("такого фала нет в бд"); }

                id = fileInDb.Id;
            }

            return id;
        }


        /// <summary>
        /// Вытаскивает из бд информацию о файле по id и возвращает его пользователю на скачку
        /// </summary>
        [HttpGet]
        [Route("download")]
        public async Task<FileResult> DownloadFile(Guid id, CancellationToken cancellationToken)
        {
            var result = await _aBISContext.Files.Where(x => x.Id == id).SingleOrDefaultAsync(cancellationToken);

            if(result == null) { throw new Exception("не удалось найти скачеваемый файл"); }

            var bytes = await System.IO.File.ReadAllBytesAsync(result.Path);

            return File(bytes, result.Mime, Path.GetFileName(result.Path));
        }
    }
}
