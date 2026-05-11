using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Eduverse.Model.Entities
{
    public class BaseEntity
    {
        public static bool operator ~(BaseEntity baseEntity) => baseEntity is not null;
    }


    public interface IEntity
    {
        public Guid Id { get; set; }
    }


    [PrimaryKey(nameof(Id))]
    public class Entity : BaseEntity, IEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        //[BsonRepresentation(BsonType.String)]
        public Guid Id { get; set; }
    }
}
