using ABIS.Data.Models;
using ABIS.Main.Cqrs.Commands;
using ABIS.Main.Cqrs.Queries;
using ABIS.Main.Models;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace ABIS.Main.Controllers
{
    /// <summary>
    /// Контроллер для обработки файлов
    /// </summary>
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class FileApiController: ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IGetDownloadFileQueryHandler _getDownloadFileHandlerQuery;

        public FileApiController(IMediator mediator, IGetDownloadFileQueryHandler getDownloadFileHandlerQuery)
        {
            _mediator = mediator;
            _getDownloadFileHandlerQuery = getDownloadFileHandlerQuery;
        }

        // Вообще с фронта полетить [FromForm]
        [HttpPost]
        public async Task<UploadCommandResult> Upload(IFormFile request, CancellationToken cancellationToken)
        {
            // меня похоже осенило и здесь пришедший http файл нужно переопределить в новую стурктуру команды
            using (var ms = new MemoryStream())
            {
                await request.CopyToAsync(ms); // получение фактических данных файла
                var fileBytes = ms.ToArray();

                var uploadFile = new UploadCommand()
                {
                    Mime = request.ContentType,
                    SizeBytes = request.Length,
                    FileName = request.FileName,
                    fileBytes = fileBytes
                };
                return await _mediator.Send(uploadFile, cancellationToken);
            }
        }

        [HttpGet]
        public async Task<FileResult> Download([FromQuery] GetDownloadFileQuery query, CancellationToken cancellationToken)
        {
            return await _getDownloadFileHandlerQuery.HandleAsync(query, cancellationToken);
        }
    }
}
