using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class BaiGiang : AuditableEntity
    {
        public string? TieuDe { get; set; }
        public string? LoaiBaiGiang { get; set; }
        public string? IdVideoBaiGiang { get; set; }
        public string? URLBaiGiang { get; set; }
        public int? ThuTuSapXep { get; set; }
        public int? ThoiLuong { get; set; }
        public bool? LaBaiGiangFree { get; set; }
        public string? TrangThai { get; set; }
        public string? TrangThaiPheDuyet { get; set; }
        public Guid IdPhan { get; set; }

        //thêm 
        public Guid? IdBaiGiangMoi { get; set; }
        public bool IsPendingSwap { get; set; } = false;
        public Guid? IdBanGhiTruoc { get; set; }
        public Guid? IdLyDo { get; set; }
        public bool IsBanHienTai { get; set; } = true;
    }
}
