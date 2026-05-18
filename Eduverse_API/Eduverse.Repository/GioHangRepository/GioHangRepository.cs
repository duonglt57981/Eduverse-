using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.GioHang
{
    public class GioHangRepository : Repository<Model.Entities.GioHang>, IGioHangRepository
    {
        public GioHangRepository(EduverseContext context) : base(context)
        {
        }
    }
}
