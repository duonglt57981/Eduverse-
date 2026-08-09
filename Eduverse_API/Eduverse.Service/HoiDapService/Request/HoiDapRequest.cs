using Eduverse.Service.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.HoiDapService.Request
{
    public class DatCauHoiRequest
    {
        public Guid IdKhoaHoc { get; set; }
        public Guid? IdBaiGiang { get; set; }
        [Required, MinLength(10)]
        public string NoiDung { get; set; } = string.Empty;
    }

    public class TraLoiRequest
    {
        public Guid IdCauHoi { get; set; }
        [Required, MinLength(5)]
        public string NoiDung { get; set; } = string.Empty;
    }

    public class SearchHoiDapRequest : SearchBase
    {
        public Guid IdKhoaHoc { get; set; }
        public Guid? IdBaiGiang { get; set; }
        public string? Keyword { get; set; }
        public bool? ChiCuaToi { get; set; }
        // "MoiNhat" | "NhieuTraLoi" | "DaGhim"
        public string SapXep { get; set; } = "MoiNhat";
    }
    public class ReplyRequest
    {
        public Guid IdCauHoi { get; set; }
        public Guid IdTraLoiDuocReply { get; set; } 
        public string NoiDung { get; set; } = string.Empty;
    }
}
