using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.PhanService.Dto
{
    public class CourseItemDto
    {
        public Guid Id { get; set; }

        /// <summary>
        /// BaiGiang | BaiKiemTra
        /// </summary>
        public string Loai { get; set; } = string.Empty;

        public int ThuTuSapXep { get; set; }
    }
}
