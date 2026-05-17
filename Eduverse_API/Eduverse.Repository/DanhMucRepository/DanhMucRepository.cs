using Eduverse.Model;
using Eduverse.IRepository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IRepository.DanhMuc
{
    public class DanhMucRepository : Repository<Model.Entities.DanhMuc>, IDanhMucRepository
    {
        public DanhMucRepository(EduverseContext context) : base(context)
        {
        }
    }
}
