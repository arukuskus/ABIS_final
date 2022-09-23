using ABIS.Data.Models;
using ABIS.Main.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ABIS.Main.Cqrs.Commands
{
    /// <summary>
    /// Запускаем команду добавления файла в store
    /// Получаем с фронта файл типа IFormFile и отдаем Id после добавления файла
    /// </summary>
    public class UploadCommandHandler : IRequestHandler<UploadCommand, UploadCommandResult>
    {
        private readonly ABISContext _aBISContext;
        private readonly IOptions<FileOptionsView> _fileOptions;

        public UploadCommandHandler(ABISContext aBISContext, IOptions<FileOptionsView> fileOptions)
        {
            _aBISContext = aBISContext;
            _fileOptions = fileOptions;
        }

        public async Task<UploadCommandResult> Handle(UploadCommand upload, CancellationToken cancellationToken)
        {

            // Создаем директорию для хранения файлов, если такой нет 
            if (!Directory.Exists(_fileOptions.Value.fileStore))
            {
                Directory.CreateDirectory(_fileOptions.Value.fileStore);
            }

            // Проверим название файла на содержание некорректных символов
            var correctlyFileName = RemoveInvalidChars(upload.FileName);
            if (String.IsNullOrEmpty(correctlyFileName))
            {
                throw new Exception($"Название файла должно содержать хотя бы 1 корректный символ в {upload.FileName}");
            }

            // Прописываем путь хранения файла
            var filePath = Path.Combine(_fileOptions.Value.fileStore, correctlyFileName);

            // если такого файла нет в директории хранения, то сохраняем этот файл
            if (!System.IO.File.Exists(filePath))
            {
                // Записываем файл в файловую систему с нужным именем
                using (var stream = new FileStream(filePath, FileMode.OpenOrCreate))
                {
                    //await upload.CopyToAsync(stream);
                    if (upload.fileBytes == null)
                    {
                        throw new Exception($"Файл должен содержать информацию {upload.fileBytes}");
                    }
                    stream.Write(upload.fileBytes);
                }

                var newFileInDb = new ABIS.Data.Models.File()
                {
                    Id = new Guid(),
                    Path = filePath,
                    Size = upload.SizeBytes,
                    Mime = upload.Mime,
                    NameInFileSystem = correctlyFileName
                };

                _aBISContext.Files.Add(newFileInDb);
                await _aBISContext.SaveChangesAsync(cancellationToken);

                return new UploadCommandResult()
                {
                    Id = (Guid)newFileInDb.Id
                };
            }
            else
            {
                // тут будем вытаскивать id из бд, если файл существует
                var fileInDb = await (from f in _aBISContext.Files
                                      where f.Name == correctlyFileName
                                      select f).SingleOrDefaultAsync(cancellationToken);

                if (fileInDb == null) { throw new Exception("такого фала нет в бд"); }

                return new UploadCommandResult()
                {
                    Id = (Guid)fileInDb.Id
                };
            }
        }

        /// <summary>
        /// удаляет все символы которые не разрешены в именах файлов
        /// </summary>
        private string RemoveInvalidChars(string file_name)
        {
            foreach (Char invalid_char in Path.GetInvalidFileNameChars())
            {
                file_name = file_name.Replace(oldValue: invalid_char.ToString(), newValue: "");
            }
            return file_name;
        }
    }
}
