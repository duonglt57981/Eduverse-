using Eduverse.Model;
using Eduverse.Repository.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.BaiKiemTraRepository
{
    public class BaiKiemTraRepository : Repository<Model.Entities.BaiKiemTra>, IBaiKiemTraRepository
    {
        public BaiKiemTraRepository(EduverseContext context) : base(context)
        {
        }
    }
}
