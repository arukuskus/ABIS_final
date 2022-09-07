namespace ABIS.Main.Models
{
    /// <summary>
    /// Возвращает посупление и список экземпляров этого поступления 
    /// </summary>
    public class ReceiptFromIdResult
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
        /// Список экземпляров книг
        /// </summary>

        public List<InstanceView> Instances { get; set; }
    }
}
