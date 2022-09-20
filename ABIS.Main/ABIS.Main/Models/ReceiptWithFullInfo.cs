namespace ABIS.Main.Models
{
    /// <summary>
    /// Возвращает посупление и список экземпляров этого поступления 
    /// </summary>
    public class ReceiptWithFullInfo
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
        /// Список изданий
        /// </summary>
        public List<InstanceView> Instances { get; set; }

        /// <summary>
        /// Список файлов
        /// </summary>
        public List<FilesForReceiptsView> Files { get; set; }
    }
}
