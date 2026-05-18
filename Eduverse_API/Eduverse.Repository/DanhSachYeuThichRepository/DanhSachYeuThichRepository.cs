using Eduverse.Model;
using Eduverse.IRepository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IRepository.DanhSachYeuThich
{
    public class DanhSachYeuThichRepository : Repository<Model.Entities.DanhSachYeuThich>, IDanhSachYeuThichRepository
    {
        public DanhSachYeuThichRepository(EduverseContext context) : base(context)
        {
        }
    }
}
