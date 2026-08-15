using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public interface IAuditableEntity
    {
        DateTime CreatedDate { get; set; }
        string? CreatedBy { get; set; }
        Guid? CreatedId { get; set; }
        DateTime UpdatedDate { get; set; }
        Guid? UpdatedId { get; set; }
        string? UpdatedBy { get; set; }
        bool IsDeleted { get; set; }
        DateTime? DeletedDate { get; set; }
        Guid? DeletedId { get; set; }
    }

    public class AuditableEntity : Entity, IAuditableEntity
    {
        

        public DateTime CreatedDate { get; set; }
        public string? CreatedBy { get; set; }
        [JsonIgnore]
        //[BsonRepresentation(BsonType.String)]
        public Guid? CreatedId { get; set; }
        public DateTime UpdatedDate { get; set; }
        public string? UpdatedBy { get; set; }
        [JsonIgnore]
        //[BsonRepresentation(BsonType.String)]
        public Guid? UpdatedId { get; set; }
        [JsonIgnore]
        public bool IsDeleted { get; set; }
        [JsonIgnore]
        public DateTime? DeletedDate { get; set; }= DateTime.UtcNow;
        [JsonIgnore]
        //[BsonRepresentation(BsonType.String)]
        public Guid? DeletedId { get; set; }
    }
}
