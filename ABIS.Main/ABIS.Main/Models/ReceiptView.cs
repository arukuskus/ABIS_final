namespace ABIS.Main.Models
{
    /// <summary>
    /// Модель поступлений
    /// </summary>
    public class ReceiptView
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

    }
}
