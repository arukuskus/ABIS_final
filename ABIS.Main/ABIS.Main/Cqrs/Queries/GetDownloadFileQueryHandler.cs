using ABIS.Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ABIS.Main.Cqrs.Queries
{
    public class GetDownloadFileQueryHandler : IGetDownloadFileQueryHandler
    {
        private readonly ABISContext _aBISContext;

        public GetDownloadFileQueryHandler(ABISContext aBISContext)
        {
            _aBISContext = aBISContext;
        }

        public async Task<FileResult> HandleAsync(GetDownloadFileQuery query, CancellationToken cancellationToken)
        {
            var result = await _aBISContext.Files.Where(x => x.Id == query.Id).SingleOrDefaultAsync(cancellationToken);

            if (result == null)
            {
                throw new Exception($"Не удалось найти скачиваемый файл");
            }

            //File(bytes, result.Mime, Path.GetFileName(result.Path))
            var bytes = await System.IO.File.ReadAllBytesAsync(result.Path);

            var downloadFile = new FileContentResult(bytes, result.Mime); //отправляем клиенту массив байт считанный из памяти

            return downloadFile;
        }
    }
}
