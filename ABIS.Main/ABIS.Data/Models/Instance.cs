using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ABIS.Data.Models
{
    /// <summary>
    /// Экземпляры книг
    /// </summary>
    public class Instance
    {

        /// <summary>
        /// Уникальное id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Краткая информация о книге
        /// </summary>
        public string Info { get; set; }

        /// <summary>
        /// Зависимость издания от поступления
        /// </summary>

        [ForeignKey(nameof(Receipt))]
        public Guid RecieptId { get; set; }
        public Receipt Receipt { get; set; }
    }
}
