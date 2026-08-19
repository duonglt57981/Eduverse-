using Eduverse.Model;
using Eduverse.Model.Entities;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.DonHang_GiangVienRepository
{
    public class DonHang_GiangVienRepository : Repository<DonHang_GiangVien>, IDonHang_GiangVienRepository
    {
        public DonHang_GiangVienRepository(EduverseContext context) : base(context)
        {
        }
    }
}
