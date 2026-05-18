using Eduverse.IRepository.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IRepository.BaiKiemTra
{
    public class BaiKiemTraRepository : Repository<Model.Entities.BaiKiemTra>, IBaiKiemTraRepository
    {
        public BaiKiemTraRepository(DbContext context) : base(context)
        {
        }
    }
}
