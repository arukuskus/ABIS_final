using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ABIS.Data.Models
{
    /// <summary>
    /// Файлы, передаваемые пользователями
    /// </summary>
    public class File
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
        public Int64 Size { get; set; }

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
        public string? Author { get; set; }
    }
}
