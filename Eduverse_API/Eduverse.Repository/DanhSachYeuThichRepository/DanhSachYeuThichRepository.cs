
using Eduverse.Model;
using Eduverse.Repository.Common;
using Eduverse.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.DanhSachYeuThichRepository
{
    public class DanhSachYeuThichRepository : Repository<Model.Entities.DanhSachYeuThich>, IDanhSachYeuThichRepository
    {
        public DanhSachYeuThichRepository(EduverseContext context) : base(context)
        {
        }
    }
}
