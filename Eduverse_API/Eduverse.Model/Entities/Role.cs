using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    [Table("Role")]
    public class Role : AuditableEntity
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Code { get; set; }

        public string? Type { get; set; }

        public bool IsActive { get; set; } = false;

    }
}
