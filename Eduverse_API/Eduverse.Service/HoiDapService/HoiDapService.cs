using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.HoiDapRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.HoiDapService
{
    public class HoiDapService : Service<HoiDap>, IHoiDapService
    {
        public HoiDapService(IHoiDapRepository hoiDapRepository) : base(hoiDapRepository)
        {
        }
    }
}
