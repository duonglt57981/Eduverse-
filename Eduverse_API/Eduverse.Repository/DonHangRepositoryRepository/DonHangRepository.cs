using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IRepository.DonHang
{
    public class DonHangRepository : Repository<Model.Entities.DonHang>, IDonHangRepository
    {
        public DonHangRepository(EduverseContext context) : base(context)
        {
        }
    }
}
