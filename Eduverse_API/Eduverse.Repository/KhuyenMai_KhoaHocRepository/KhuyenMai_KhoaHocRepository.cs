using Eduverse.Repository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.KhuyenMai_KhoaHocRepository
{
    public class KhuyenMai_KhoaHocRepository : Repository<Model.Entities.KhuyenMai_KhoaHoc>, IKhuyenMai_KhoaHocRepository
    {
        public KhuyenMai_KhoaHocRepository(EduverseContext context) : base(context)
        {
        }
    }
}
