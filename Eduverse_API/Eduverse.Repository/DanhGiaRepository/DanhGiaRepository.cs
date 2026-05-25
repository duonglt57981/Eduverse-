using Eduverse.Model;
using Eduverse.Repository.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.DanhGiaRepository
{
    public class DanhGiaRepository : Repository<Model.Entities.DanhGia>, IDanhGiaRepository
    {
        public DanhGiaRepository(EduverseContext context) : base(context)
        {
        }
    }
}
