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
        /// К какому поступлению относится этот экземпляр
        /// </summary>
        [Required]
        public string ReceiptName { get; set; }

        /// <summary>
        /// Краткая информация о книге
        /// </summary>
        [Required]
        public string Info { get; set; }

        [ForeignKey(nameof(Receipt))]
        public Guid RecieptId { get; set; }
        public Receipt Receipt { get; set; }
    }
}
