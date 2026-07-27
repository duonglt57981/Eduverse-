using Eduverse.Service.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class GetListSearch : SearchBase
    {
        public string? Keyword { get; set; }

        // Lọc theo trạng thái: "TatCa", "DaDuyet", "ChoDuyet", "DangDuyet", "TuChoi", "DangSua"
        public string? TrangThai { get; set; } = "TatCa";

        // Sắp xếp ngày tạo: "Cu" (cũ nhất trước) | "Moi" (mới nhất trước)
        public string? SapXepNgay { get; set; }

        // Sắp xếp tên: "AZ" | "ZA"
        public string? SapXepTen { get; set; }

        public bool? SapXepHocVienNhieuNhat { get; set; }
    }
}
