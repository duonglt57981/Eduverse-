using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.GioHangChiTietRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.GioHangChiTietService
{
    public class GioHangChiTietService : Service<GioHangChiTiet>, IGioHangChiTietService
    {
        public GioHangChiTietService(IGioHangChiTietRepository gioHangChiTietRepository) : base(gioHangChiTietRepository)
        {
        }
    }
}
