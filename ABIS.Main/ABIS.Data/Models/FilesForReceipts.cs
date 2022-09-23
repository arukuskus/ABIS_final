using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ABIS.Data.Models
{
    /// <summary>
    /// Таблица, которая связывает файлы с поступлениями
    /// </summary>
    public class FilesForReceipts
    {
        /// <summary>
        /// Id файла (будет приходить из таблицы Files)
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название файла, которое присваивается в момент закрепления файла
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Дата закрепления файла за поступлением
        /// </summary>
        public DateTime CreatedDate { get; set; }

        /// <summary>
        /// Размер фйла в байтах
        /// </summary>
        public Int64 Size { get; set; }

        /// <summary>
        /// Фактическое название файла (будет приходить из таблицы Files)
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// Зависимость прикрепленного файла от поступления
        /// </summary>

        [ForeignKey(nameof(Receipt))]
        public Guid RecieptId { get; set; }
        public Receipt Receipt { get; set; }
    }
}
