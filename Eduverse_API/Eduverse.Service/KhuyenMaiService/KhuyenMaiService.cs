using Eduverse.IService.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.KhuyenMaiRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.IService.KhuyenMaiService
{
    public class KhuyenMaiService : Service<KhuyenMai>, IKhuyenMaiService
    {
        public KhuyenMaiService(IKhuyenMaiRepository khuyenMaRepository) : base(khuyenMaRepository)
        {
        }
    }
}
