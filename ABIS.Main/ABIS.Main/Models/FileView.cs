namespace ABIS.Main.Models
{
    /// <summary>
    /// Модель представления пришедшего файла
    /// </summary>
    public class FileView
    {
        /// <summary>
        /// ИД файла
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название файла, которое пришло при загрузке
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Путь от корня файлового хранилища (из appsettings) до файла
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// Название файла на файловой системе (например все файлы называются {id}.data)
        /// </summary>
        // этот момент не до конца понимаю
        public string NameInFileSystem { get; set; }

        /// <summary>
        /// Размер фйла в байтах
        /// </summary>
        public int Size { get; set; }

        /// <summary>
        /// Тип файла
        /// </summary>
        public string Mime { get; set; }

        /// <summary>
        /// Дата и время загрузки файла
        /// </summary>
        public DateTime DateTime { get; set; }

        /// <summary>
        /// Автор загрузки файла
        /// </summary>
        public string Author { get; set; }
    }
}
