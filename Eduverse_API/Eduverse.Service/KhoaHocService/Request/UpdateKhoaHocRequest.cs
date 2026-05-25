using Eduverse.Service.KhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class UpdateKhoaHocRequest : KhoaHocDto
    {

        public List<Guid>? DanhSachDanhMuc { get; set; }
    }
}
