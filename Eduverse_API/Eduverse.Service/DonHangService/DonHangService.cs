using Eduverse.Repository.Common;
using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Eduverse.Repository.DonHangRepositoryRepository;


namespace Eduverse.Service.DonHangService
{
    public class DonHangService : Service<DonHang>, IDonHangService
    {
        public DonHangService(IDonHangRepository donHangRepository) : base(donHangRepository)
        {
        }
    }
}
