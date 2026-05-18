using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.GioHangChiTiet
{
    public class GioHangChiTietRepository : Repository<Model.Entities.GioHangChiTiet>, IGioHangChiTietRepository
    {
        public GioHangChiTietRepository(EduverseContext context) : base(context)
        {
        }
    }
}
