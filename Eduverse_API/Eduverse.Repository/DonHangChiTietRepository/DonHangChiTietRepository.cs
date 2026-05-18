using Eduverse.IRepository.Common;
using Eduverse.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Repository.DonHangChiTiet
{
     public class DonHangChiTietRepository : Repository<Model.Entities.DonHangChiTiet>, IDonHangChiTietRepository
    {
        public DonHangChiTietRepository(EduverseContext context) : base(context)
        {
        }
    }
}
