using Eduverse.Repository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.NganHangRepository
{
    public class NganHangRepository : Repository<Model.Entities.NganHang>, INganHangRepository
    {
        public NganHangRepository(EduverseContext context) : base(context)
        { }
        }
}
