using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.AppUserService.Dto
{
    public class NhanVienPheDuyetDto
    {
        public Guid? UserId { get; set; }
        public string HoTen { get; set; }
        public string Role { get; set; }
        public string AnhDaiDien { get; set; }
        public int SoLuongKhoaHocDuyet { get; set; }
    }
}
