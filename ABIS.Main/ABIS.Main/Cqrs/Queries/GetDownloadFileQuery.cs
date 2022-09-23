namespace ABIS.Main.Cqrs.Queries
{
    /// <summary>
    /// CQRS запрос на получение скачиваемого файла
    /// </summary>
    public class GetDownloadFileQuery
    {
        /// <summary>
        /// Id скачиваемого файла
        /// </summary>
        public Guid Id { get; init; }
    }
}
