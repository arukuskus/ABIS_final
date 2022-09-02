using Microsoft.EntityFrameworkCore;
using Npgsql;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ABIS.Data.Models
{
    /// <summary>
    /// Класс контекста данных
    /// </summary>
    public partial class ABISContext : DbContext
    {
        /// <summary>
        /// Таблица экземпляров книг
        /// </summary>
        public DbSet<Instance> Instances { get; set; } = null!;

        /// <summary>
        /// Таблица поступлений
        /// </summary>
        public DbSet<Receipt> Receipts { get; set; } = null!;

        /// <summary>
        /// Контекст БД, в который передаются опции из конфигурации
        /// </summary>
        public ABISContext(DbContextOptions<ABISContext> options) : base(options) { }

        /// <summary>
        /// Отношения
        /// </summary>
        /// Это Fluent
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Instance>(entity =>
            {
                entity.ToTable("instances");

                entity.HasComment("таблица экземпляров книг");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.ReceiptName).HasColumnName("receipt_name").HasComment("в каком поступлении пришел этот экземпляр");

                entity.Property(e => e.Info).HasColumnName("info").HasComment("какая - то информация о книге");

                //entity.HasOne(i => i.Receipt).WithMany(r => r.Instances).HasForeignKey(i => i.ReceptId);

            });

            modelBuilder.Entity<Receipt>(entity => 
            {
                entity.ToTable("receipts");

                entity.HasComment("таблица поступлений");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.Name).HasColumnName("name").HasComment("наименование поступления");

                entity.Property(e => e.CreatedDate).HasColumnName("created_date").HasComment("дата создания поступления");

                entity.Property(e => e.InstanceId).HasColumnName("instance_id").HasComment("индекс экземпляра, внесенного в это поступление");
                
            });

            // Один ко многим (экземпляр книги может относится к нескольким поступлениям ?)
            modelBuilder.Entity<Receipt>()
                .HasOne<Instance>()
                .WithMany()
                .HasForeignKey(s => s.InstanceId);
            

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);

        /*private readonly object _syncObj = new object();
        protected string? ConnectionString { get; private set; }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (optionsBuilder.IsConfigured)
            {
                return;
            }

            if (ConnectionString == null)
            {
                lock (_syncObj)
                {
                    if (ConnectionString == null)
                    {
                        var builder = new NpgsqlConnectionStringBuilder("Application ABIS.Main;Host=localhost;Port=5432;Database=ABIS;Username=abis_owner;Password=Vikibngs+death9898");

                        ConnectionString = builder.ConnectionString;
                    }
                }
            }

            optionsBuilder.UseNpgsql(ConnectionString);

            base.OnConfiguring(optionsBuilder);
        }*/
    }
}
