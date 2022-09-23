namespace ABIS.Main.Cqrs.Commands
{
    /// <summary>
    /// Результатом выполнения команды сохранения файла будет id
    /// </summary>
    public class UploadCommandResult
    {
        /// <summary>
        /// Id файла, добавленного в store
        /// </summary>
        public Guid Id { get; set; }
    }
}
