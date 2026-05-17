using Eduverse.IRepository.Common;
using Eduverse.IRepository.DonHang;
using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.DonHangService
{
    public class DonHangService : Service<Model.Entities.DonHang>, IDonHangService
    {
        public DonHangService(IDonHangRepository donHangRepository) : base(donHangRepository)
        {
        }
    }
}
