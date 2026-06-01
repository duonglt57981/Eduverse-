using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TienDoHocTapService.Dto
{
    public class TienDoHocTapDto
    {
        public Guid IdBaiGiang { get; set; }

        public int ThoiGianXem { get; set; }

        public string TrangThai { get; set; } = string.Empty;
    }
}
