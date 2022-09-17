using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ABIS.Data.Models
{
    /// <summary>
    /// Поступления
    /// </summary>
    public class Receipt
    {
        /// <summary>
        /// Уникальный id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Название поступления
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Дата создания поступления 
        /// </summary>
        public DateTime CreatedDate { get; set; }

        /// <summary>
        /// У одного поступления может быть много изданий
        /// </summary>
        public List<Instance> Instances { get; set; }
    }
}
