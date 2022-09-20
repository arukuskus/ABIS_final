namespace ABIS.Main.Models
{
    /// <summary>
    /// Модель, которая связывает файлы с поступлениями
    /// </summary>
    public class FilesForReceiptsView
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
        /// Тип файла (будет приходить из таблицы Files)
        /// </summary>
        public string Mime { get; set; }

        /// <summary>
        /// Фактическое название файла (будет приходить из таблицы Files)
        /// </summary>
        public string FileName { get; set; }
    }
}
