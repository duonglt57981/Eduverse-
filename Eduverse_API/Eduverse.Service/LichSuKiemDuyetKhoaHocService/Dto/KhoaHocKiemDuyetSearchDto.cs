using Eduverse.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LichSuKiemDuyetKhoaHocService.Dto
{
    public class KhoaHocKiemDuyetSearchDto : SearchBase
    {
        public string? Keyword { get; set; }

        // Lọc theo trạng thái: "ChoDuyet", "DangDuyet", hoặc null để lấy cả hai
        public string? TrangThaiPheDuyet { get; set; }

        // Sắp xếp: "Moi" (mới nhất trước), "Cu" (cũ nhất trước) - mặc định "Cu"
        public string? SapXepNgay { get; set; } = "Cu";

        // Sắp xếp tên: "AZ" hoặc "ZA"
        public string? SapXepTen { get; set; }
    }
}
