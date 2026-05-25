using Eduverse.Service.Common;
using Eduverse.Model;
using Eduverse.Repository.ChiTietLamBaiKiemTraRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.ChiTietLamBaiKiemTraService
{
    public class ChiTietLamBaiKiemTraService : Service<Model.Entities.ChiTietLamBaiKiemTra>, IChiTietLamBaiKiemTraService
    {
        public ChiTietLamBaiKiemTraService(IChiTietLamBaiKiemTraRepository chiTietLamBaiKiemTraRepository) : base(chiTietLamBaiKiemTraRepository)
        {
        }
    }
}
