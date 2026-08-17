using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Model.Entities;
using Eduverse.Service.DapAnService.Dto;
using Microsoft.Identity.Client;

namespace Eduverse.Service.CauHoiService.Dto
{
    public class CauHoiDto
    {
        public Guid Id { get; set; }
        public Guid IdBaiKiemTra { get; set; }
        public string TenCauHoi { get; set; }
        public string? NoiDungCauHoi { get; set; }
        public string? DoKho { get; set; }
        public string? LoaiCauHoi { get; set; }
        public int? ThuTuSapXep { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public string? CreatedBy { get; set; }
        public string? UpdatedBy { get; set; }
        public DateTime UpdatedDate { get; set; }

        public List<DapAnDto> DanhSachDapAns { get; set; }
    }
}
