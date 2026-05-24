using Eduverse.Repository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.KhuyenMaiRepository
{
    public class KhuyenMaiRepository : Repository<Model.Entities.KhuyenMai>, IKhuyenMaiRepository
    {
        public KhuyenMaiRepository(EduverseContext context) : base(context)
        {
        }
    }

}