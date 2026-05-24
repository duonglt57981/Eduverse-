using Eduverse.Repository.Common;
using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Repository.DonHangRepositoryRepository;


namespace Eduverse.IService.DonHangService
{
    public class DonHangService : Service<DonHang>, IDonHangService
    {
        public DonHangService(IDonHangRepository donHangRepository) : base(donHangRepository)
        {
        }
    }
}
