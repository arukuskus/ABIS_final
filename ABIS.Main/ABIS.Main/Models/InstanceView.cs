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
        public Guid? Id { get; set; }

        /// <summary>
        /// Краткая информация о книге
        /// </summary>
        public string Info { get; set; }

        /// <summary>
        /// Id поступления в котором находится эта книга
        /// </summary>
        public Guid? RecieptId { get; set; }
    }
}
