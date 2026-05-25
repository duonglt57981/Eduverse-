using Eduverse.Repository.Common;
using Eduverse.Service.Common;
using Eduverse.Model.Entities;
using Eduverse.Repository.KhuyenMai_KhoaHocRepository;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Eduverse.Service.KhuyenMai_KhoaHocService
{
    public class KhuyenMai_KhoaHocService : Service<KhuyenMai_KhoaHoc>, IKhuyenMai_KhoaHocService
    {
        public KhuyenMai_KhoaHocService(IKhuyenMai_KhoaHocRepository khuyenMai_KhoaHocRepository) : base(khuyenMai_KhoaHocRepository)
        {
        }
    }
}
