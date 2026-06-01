using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.TienDoHocTapService.Request
{
    public class UpdateTienDoBaiGiangRequest
    {
        public Guid IdDangKyKhoaHoc{ get; set; }

        public Guid IdBaiGiang { get; set; }

        public int ThoiGianXem { get; set; }
        public DateTime? LanCuoiXem { get; set; }
    }
}
