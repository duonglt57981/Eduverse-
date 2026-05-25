using Eduverse.Model.Entities;
using Eduverse.Service.Dto;
using Eduverse.Service.KhoaHocService.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhoaHocService.Request
{
    public class KhoaHocSearch : SearchBase
    {



        //search
        public string? Keyword { get; set; }

        public string? TieuDe { get; set; }

        public string? CapDo { get; set; }

        public string? LoaiKhoaHoc { get; set; }

        public string? TrangThai { get; set; }

        public string? TrangThaiPheDuyet { get; set; }

        public double? GiaFrom { get; set; }

        public double? GiaTo { get; set; }

        public int? TongBaiGiangFrom { get; set; }

        public int? TongBaiGiangTo { get; set; }

        public bool? IsFree { get; set; }

        public string? SortPrice { get; set; }
    }
}

