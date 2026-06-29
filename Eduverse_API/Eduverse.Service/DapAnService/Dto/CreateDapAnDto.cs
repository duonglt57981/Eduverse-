using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.DapAnService.Dto
{
    public class CreateDapAnDto
    {
        public Guid Id { get; set; }
        public Guid? IdCauHoi { get; set; }
        public string? NoiDungDapAn { get; set; }
        public bool? LaDapAnDung { get; set; }
        public int? ThuTuSapXep { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
    }
}
