using MediatR;

namespace ABIS.Main.Cqrs.Commands
{
    /// <summary>
    /// Команда для сохранения пришедшего файла в store
    /// </summary>
    public class UploadCommand : IRequest<UploadCommandResult>
    {
        /// <summary>
        /// Тип загружаемого файла
        /// </summary>
        public string Mime { get; set; }

        /// <summary>
        /// Размер файла в байтах
        /// </summary>
        public long SizeBytes { get; set; }

        /// <summary>
        /// Название файла
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// Файл в виде массива байт
        /// </summary>
        public byte[] fileBytes { get; set; }
    }
}
