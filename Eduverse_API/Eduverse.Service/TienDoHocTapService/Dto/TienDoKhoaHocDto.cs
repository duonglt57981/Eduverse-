using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TienDoHocTapService.Dto
{
    public class TienDoKhoaHocDto
    {
        public int TongBaiGiang { get; set; }

        public int BaiGiangHoanThanh { get; set; }

        public List<Guid> DanhSachBaiGiangHoanThanh { get; set; } = [];
    }
}
