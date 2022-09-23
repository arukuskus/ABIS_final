using Microsoft.AspNetCore.Mvc;

namespace ABIS.Main.Cqrs.Queries
{
    public interface IGetDownloadFileQueryHandler
    {
        Task<FileResult> HandleAsync(GetDownloadFileQuery query, CancellationToken ct);
    }
}
