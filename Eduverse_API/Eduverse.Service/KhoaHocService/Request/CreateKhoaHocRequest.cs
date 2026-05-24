using Eduverse.Model.Entities;
using Eduverse.Service.KhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class CreateKhoaHocRequest : KhoaHoc
    {
        // Danh sách danh mục
        public List<Guid>? DanhSachDanhMuc { get; set; }
    }
}
