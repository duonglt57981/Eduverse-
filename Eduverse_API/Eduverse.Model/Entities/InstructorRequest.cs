using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Eduverse.Model.Entities
{
    public class InstructorRequest : AuditableEntity
    {
        [Required]
        public Guid AppUserId { get; set; }

        [ForeignKey("AppUserId")]
        public virtual AppUser? AppUser { get; set; }

        [Required]
        [MaxLength(250)]
        public string ChuyenMon { get; set; } = string.Empty; // Specialty/expertise

        [Required]
        [MaxLength(2000)]
        public string KinhNghiem { get; set; } = string.Empty; // Experience

        [Required]
        [MaxLength(2000)]
        public string LyDo { get; set; } = string.Empty; // Reason/Motivation

        public int Status { get; set; } // 0 = Pending, 1 = Approved, 2 = Rejected

        [MaxLength(2000)]
        public string? AdminNotes { get; set; } // Admin notes / feedback
    }
}
