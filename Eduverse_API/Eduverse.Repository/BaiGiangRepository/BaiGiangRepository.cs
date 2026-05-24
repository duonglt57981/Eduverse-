using Eduverse.Repository.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.BaiGiangRepository
{
    public class BaiGiangRepository : Repository<Model.Entities.BaiGiang>, IBaiGiangRepository
    {
        public BaiGiangRepository(Model.EduverseContext context) : base(context)
        {
        }
    }
}
