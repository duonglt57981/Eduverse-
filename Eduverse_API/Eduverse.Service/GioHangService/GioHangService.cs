using Eduverse.IService.Common;
using Eduverse.Repository.GioHang;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.GioHangService
{
    public class GioHangService : Service<Model.Entities.GioHang>, IGioHangService
    {
        public GioHangService(IGioHangRepository gioHangRepository) : base(gioHangRepository)
        {
        }
    }
}
