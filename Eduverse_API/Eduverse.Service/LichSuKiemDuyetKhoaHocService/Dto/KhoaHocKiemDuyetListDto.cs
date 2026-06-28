using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KhoaHocKiemDuyetListDto
    {
        public Guid IdKhoaHoc { get; set; }
        public string TenKhoaHoc { get; set; }
        public DateTime? NgayGuiDuyet { get; set; }
        public int SoBaiGiangChoDuyet { get; set; }
        public int SoTaiLieuChoDuyet { get; set; }
    }
}
