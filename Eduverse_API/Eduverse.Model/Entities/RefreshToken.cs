using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Model.Entities
{
    public class RefreshToken
    {
        public int IDRefreshToken { get; set; }
        public string Token {  get; set; }
        public DateTime NgayHetHan {  get; set; }
        public DateTime NgayTao {  get; set; }
        public bool DaBiThuHoi { get; set; }
        public int IDTaiKhoan { get; set; }

        public Guid AppUserId { get; set; }
        public AppUser AppUser { get; set; }

    }
}
