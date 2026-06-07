using Eduverse.Repository.Common;
using Eduverse.Model;
using Eduverse.Model.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.GioHangRepository
{
    public class GioHangRepository : Repository<Model.Entities.GioHang>, IGioHangRepository
    {
        public GioHangRepository(EduverseContext context) : base(context)
        { }
    }
}
