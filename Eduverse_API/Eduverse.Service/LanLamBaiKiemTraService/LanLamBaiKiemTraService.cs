using Eduverse.Service.Common;
using Eduverse.Repository.LanLamBaiKiemTraRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.LanLamBaiKiemTraService
{
    public class LanLamBaiKiemTraService : Service<Model.Entities.LanLamBaiKiemTra>, ILanLamBaiKiemTraService   
    {
        public LanLamBaiKiemTraService(ILanLamBaiKiemTraRepository lanLamBaiKiemTraRepository) : base(lanLamBaiKiemTraRepository)
        {
        }
    }
}
