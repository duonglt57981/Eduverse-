using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Model.Entities;
using Eduverse.Service.DapAnService.Dto;

namespace Eduverse.Service.CauHoiService.Dto
{
    public class CauHoiDto
    {
        public Guid Id { get; set; }
        public string TenCauHoi { get; set; }
        public string? NoiDungCauHoi { get; set; }

        public List<CreateDapAnDto> DanhSachDapAns { get; set; }
    }
}
