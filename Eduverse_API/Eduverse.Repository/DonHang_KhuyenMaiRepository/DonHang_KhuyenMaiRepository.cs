using Eduverse.Model;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.DonHang_KhuyenMaiRepository
{
    public class DonHang_KhuyenMaiRepository : Repository<Model.Entities.DonHang_KhuyenMai>, IDonHang_KhuyenMaiRepository
    {
        public DonHang_KhuyenMaiRepository(EduverseContext context) : base(context)
        {
        }
    }
}
