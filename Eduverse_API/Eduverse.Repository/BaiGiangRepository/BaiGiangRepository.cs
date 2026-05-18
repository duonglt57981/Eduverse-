using Eduverse.IRepository.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IRepository.BaiGiang
{
    public class BaiGiangRepository : Repository<Model.Entities.BaiGiang>, IBaiGiangRepository
    {
        public BaiGiangRepository(DbContext context) : base(context)
        {
        }
    }
}
