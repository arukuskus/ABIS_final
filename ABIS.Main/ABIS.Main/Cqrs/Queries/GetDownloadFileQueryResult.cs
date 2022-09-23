using Microsoft.AspNetCore.Mvc;

namespace ABIS.Main.Cqrs.Queries
{
    /// <summary>
    /// Результатом запроса будет доступлный для загрузки файл
    /// </summary>
    public class GetDownloadFileQueryResult
    {
        public FileContentResult file { get; set; }
        // либо
        //FileResult downloadFile { get; set; }
    }
}
