using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Model.Entities;
using Eduverse.Service.DapAnService.Dto;

namespace Eduverse.Service.CauHoiService.Dto
{
    public class CauHoiDto : CauHoi
    {
        public Guid Id { get; set; }

        public string TenCauHoi { get; set; } = string.Empty;

        public string NoiDungCauHoi { get; set; } = string.Empty;

        public int? LoaiCauHoi { get; set; }

        public double? Diem { get; set; }

        public List<DapAnDto> DanhSachDapAn { get; set; } = [];
    }
}
