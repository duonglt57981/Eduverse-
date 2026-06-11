using Eduverse.Service.Common;
using Eduverse.Repository.GioHangRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.GioHangService
{
    public class GioHangService : Service<Model.Entities.GioHang>, IGioHangService
    {
        public GioHangService(IGioHangRepository gioHangRepository) : base(gioHangRepository)
        {
        }
    }
}
