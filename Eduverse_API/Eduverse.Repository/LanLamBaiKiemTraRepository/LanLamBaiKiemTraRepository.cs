using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.LanLamBaiKiemTraRepository
{
    public class LanLamBaiKiemTraRepository : Repository<Model.Entities.LanLamBaiKiemTra>, ILanLamBaiKiemTraRepository
    {
            public LanLamBaiKiemTraRepository(EduverseContext context) : base(context)
            {
        }
    }
}
