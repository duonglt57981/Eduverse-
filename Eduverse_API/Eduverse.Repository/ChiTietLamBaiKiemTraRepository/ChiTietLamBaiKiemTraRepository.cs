using Eduverse.IRepository.Common;
using Eduverse.Model;
using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.ChiTietLamBaiKiemTraRepository
{
    public class ChiTietLamBaiKiemTraRepository : Repository<ChiTietLamBaiKiemTra>, IChiTietLamBaiKiemTraRepository
    {
        public ChiTietLamBaiKiemTraRepository(EduverseContext context) : base(context)
        { }
        }
}
