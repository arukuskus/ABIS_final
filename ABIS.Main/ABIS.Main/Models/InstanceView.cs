namespace ABIS.Main.Models
{
    /// <summary>
    /// Модель экземпляра книги
    /// </summary>
    public class InstanceView
    {
        /// <summary>
        /// Уникальный id
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// К какому поступлению относится этот экземпляр
        /// </summary>
        public string ReceiptName { get; set; }

        /// <summary>
        /// Краткая информация о книге
        /// </summary>
        public string Info { get; set; }
    }
}
