using Eduverse.Service.DapAnService.Dto;
using Eduverse.Service.DapAnService.Request;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.CauHoiService.Dto
{
    public class CreateCauHoiDto
    {
        public Guid Id { get; set; }
        public Guid? IdBaiKiemTra { get; set; }
        public string TenCauHoi { get; set; }
        public string? NoiDungCauHoi { get; set; }
        public double? Diem { get; set; }

        public List<DapAnDto> DanhSachDapAns { get; set; }
    }
}
