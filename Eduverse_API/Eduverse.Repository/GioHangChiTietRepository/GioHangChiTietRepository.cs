using Eduverse.Repository.Common;
using Eduverse.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.GioHangChiTietRepository
{
    public class GioHangChiTietRepository : Repository<Model.Entities.GioHangChiTiet>, IGioHangChiTietRepository
    {
        public GioHangChiTietRepository(EduverseContext context) : base(context)
        {
        }
    }
}
